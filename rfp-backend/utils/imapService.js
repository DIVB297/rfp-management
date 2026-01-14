const Imap = require('imap');
const { simpleParser } = require('mailparser');
const VendorResponse = require('../models/VendorResponse');
const RFP = require('../models/RFP');
const { analyzeVendorResponse } = require('./aiAnalysis');

// Create IMAP connection
const createImapConnection = () => {
  return new Imap({
    user: process.env.IMAP_USER || process.env.SMTP_USER,
    password: process.env.IMAP_PASS || process.env.SMTP_PASS,
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT) || 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });
};

// Parse email and extract RFP ID from subject or body
const extractRFPId = (subject, text) => {
  // Ensure subject and text are strings
  const safeSubject = subject || '';
  const safeText = text || '';
  
  // Try to find RFP ID in subject (format: "Re: New RFP Submission: Project Title" or "RFP: 673abc123...")
  const rfpIdMatch = safeSubject.match(/RFP[:\s]+([a-f0-9]{24})/i) || 
                      safeText.match(/RFP\s*ID[:\s]+([a-f0-9]{24})/i) ||
                      safeSubject.match(/([a-f0-9]{24})/i) ||  // Also match any 24-char hex in subject
                      safeText.match(/([a-f0-9]{24})/i);       // Or in body
  
  if (rfpIdMatch) {
    return rfpIdMatch[1];
  }
  
  return null;
};

// Parse vendor response from email
const parseVendorResponse = async (mail, rfpId, isRead) => {
  try {
    const fromEmail = mail.from.value[0].address;
    const fromName = mail.from.value[0].name || fromEmail;
    
    // Extract proposal details from email text
    const text = mail.text || '';
    const html = mail.html || '';
    
    // Try to extract key information using regex with safe checks
    const priceMatch = text.match(/(?:price|cost|budget)[:\s]*\$?[\s]*([0-9,]+)/i);
    const timelineMatch = text.match(/(?:timeline|duration|time)[:\s]*([0-9]+)\s*(?:days|weeks|months)/i);
    const experienceMatch = text.match(/(?:experience|years)[:\s]*([0-9]+)\s*(?:years?)/i);
    const teamSizeMatch = text.match(/(?:team size|members)[:\s]*([0-9]+)/i);
    
    // Extract timeline with safe null check
    let timeline = '';
    if (timelineMatch && timelineMatch[1] && timelineMatch[0]) {
      try {
        const timeUnitMatch = timelineMatch[0].match(/(days|weeks|months)/i);
        if (timeUnitMatch && timeUnitMatch[0]) {
          timeline = `${timelineMatch[1]} ${timeUnitMatch[0]}`;
        } else {
          timeline = `${timelineMatch[1]} days`;
        }
      } catch (err) {
        console.error('Error parsing timeline:', err);
        timeline = '';
      }
    }
    
    // Process attachments
    const attachments = [];
    if (mail.attachments && mail.attachments.length > 0) {
      console.log(`   📎 Found ${mail.attachments.length} attachment(s)`);
      
      for (const attachment of mail.attachments) {
        if (attachment.content) {
          try {
            const fs = require('fs');
            const path = require('path');
            
            // Create attachments directory if it doesn't exist
            const attachmentsDir = path.join(__dirname, '../uploads/attachments');
            if (!fs.existsSync(attachmentsDir)) {
              fs.mkdirSync(attachmentsDir, { recursive: true });
            }
            
            // Generate unique filename
            const timestamp = Date.now();
            const safeFilename = attachment.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
            const uniqueFilename = `${timestamp}_${safeFilename}`;
            const filePath = path.join(attachmentsDir, uniqueFilename);
            
            // Save attachment to disk
            fs.writeFileSync(filePath, attachment.content);
            
            attachments.push({
              filename: attachment.filename,
              path: filePath,
              mimetype: attachment.contentType,
              size: attachment.size
            });
            
            console.log(`   ✓ Saved attachment: ${attachment.filename} (${(attachment.size / 1024).toFixed(2)} KB)`);
          } catch (error) {
            console.error(`   ✗ Error saving attachment ${attachment.filename}:`, error.message);
          }
        }
      }
    }
    
    return {
      rfpId,
      vendorEmail: fromEmail,
      vendorName: fromName,
      proposedPrice: priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null,
      timeline: timeline,
      experience: experienceMatch ? `${experienceMatch[1]} years` : '',
      teamSize: teamSizeMatch ? parseInt(teamSizeMatch[1]) : null,
      approach: text.substring(0, 1000), // Store first 1000 chars as approach
      notes: `Email received: ${mail.subject}`,
      receivedAt: mail.date,
      emailSubject: mail.subject,
      emailBody: text,
      emailHtml: html.substring(0, 5000), // Store first 5000 chars of HTML
      attachments: attachments,
      isRead: isRead || false
    };
  } catch (error) {
    console.error('Error in parseVendorResponse:', error);
    console.error('Mail object:', JSON.stringify(mail, null, 2));
    throw error;
  }
};

// Sync emails from inbox
const syncEmails = async () => {
  return new Promise((resolve, reject) => {
    const imap = createImapConnection();
    const syncResults = {
      processed: 0,
      created: 0,
      errors: 0,
      emails: []
    };

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for emails from the last 5 days
        const searchCriteria = [
          ['SINCE', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)],
        ];

        imap.search(searchCriteria, (err, searchResults) => {
          if (err) {
            imap.end();
            reject(err);
            return;
          }

          if (searchResults.length === 0) {
            imap.end();
            resolve({ processed: 0, created: 0, errors: 0, emails: [] });
            return;
          }

          const fetch = imap.fetch(searchResults, { 
            bodies: '',
            struct: true 
          });
          const emailPromises = [];

          fetch.on('message', (msg, seqno) => {
            const emailPromise = new Promise((resolveEmail) => {
              let emailFlags = [];
              
              msg.on('attributes', (attrs) => {
                emailFlags = attrs.flags || [];
              });
              
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, mail) => {
                  if (err) {
                    console.error('Error parsing email:', err);
                    syncResults.errors++;
                    resolveEmail();
                    return;
                  }

                  try {
                    syncResults.processed++;
                    
                    // Check if email is read
                    const isRead = emailFlags.includes('\\Seen');
                    
                    // Get sender email
                    const senderEmail = mail.from?.value?.[0]?.address;
                    if (!senderEmail) {
                      console.log('No sender email found');
                      resolveEmail();
                      return;
                    }

                    console.log(`\n📧 Processing email from: ${senderEmail}`);
                    console.log(`   Subject: ${mail.subject}`);
                    
                    // Find RFP where this sender is a selected vendor (case-insensitive)
                    const rfp = await RFP.findOne({ 
                      selectedVendors: { $regex: new RegExp(`^${senderEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
                    }).sort({ createdAt: -1 });
                    
                    if (!rfp) {
                      console.log(`   ✗ No RFP found where ${senderEmail} is a vendor`);
                      resolveEmail();
                      return;
                    }
                    
                    const rfpId = rfp._id.toString();
                    console.log(`   ✓ Found RFP: ${rfpId} - ${rfp.projectTitle}`);
                    console.log(`   ✓ ${senderEmail} is an authorized vendor`);

                    // Parse vendor response
                    let responseData;
                    try {
                      responseData = await parseVendorResponse(mail, rfpId, isRead);
                    } catch (parseError) {
                      console.error(`Error parsing email from ${mail.from?.value?.[0]?.address || 'unknown'}:`, parseError.message);
                      syncResults.errors++;
                      resolveEmail();
                      return;
                    }
                    
                    console.log(`=== Processing Email ===`);
                    console.log(`From: ${responseData.vendorEmail}`);
                    console.log(`Subject: ${mail.subject}`);
                    console.log(`RFP ID: ${rfpId}`);
                    
                    // Check if response already exists
                    const existingResponse = await VendorResponse.findOne({
                      rfpId,
                      vendorEmail: responseData.vendorEmail,
                      emailSubject: mail.subject
                    });

                    if (existingResponse) {
                      // Update read status if changed
                      if (existingResponse.isRead !== isRead) {
                        existingResponse.isRead = isRead;
                        await existingResponse.save();
                        console.log(`   ✓ Updated read status: ${isRead}`);
                      } else {
                        console.log(`   ✓ Response already exists`);
                      }
                      resolveEmail();
                      return;
                    }

                    // Create new vendor response (vendor already verified above)
                    const vendorResponse = new VendorResponse(responseData);
                    await vendorResponse.save();
                    
                    syncResults.created++;
                    syncResults.emails.push({
                      from: responseData.vendorEmail,
                      subject: mail.subject,
                      rfpId
                    });

                    console.log(`   ✓ Created vendor response`);
                    
                    // Trigger AI analysis in background
                    analyzeVendorResponse(rfp, vendorResponse)
                      .then(async (analysis) => {
                        vendorResponse.aiAnalysis = analysis;
                        vendorResponse.status = 'analyzed';
                        await vendorResponse.save();
                        console.log(`   ✓ AI analysis completed for ${responseData.vendorEmail}`);
                      })
                      .catch(error => {
                        console.error(`   ✗ AI analysis failed for ${responseData.vendorEmail}:`, error.message);
                      });
                    
                    console.log(`======================\n`);
                    resolveEmail();
                  } catch (error) {
                    console.error('Error processing email:', error);
                    syncResults.errors++;
                    resolveEmail();
                  }
                });
              });
            });

            emailPromises.push(emailPromise);
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
            imap.end();
            reject(err);
          });

          fetch.once('end', async () => {
            await Promise.all(emailPromises);
            imap.end();
            resolve(syncResults);
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
};

// Get inbox statistics
const getInboxStats = async () => {
  return new Promise((resolve, reject) => {
    const imap = createImapConnection();

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        const stats = {
          total: box.messages.total,
          new: box.messages.new,
          unseen: box.messages.unseen
        };

        imap.end();
        resolve(stats);
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.connect();
  });
};

module.exports = {
  syncEmails,
  getInboxStats,
  createImapConnection
};
