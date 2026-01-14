const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email to admin when new RFP is submitted
const sendNewRFPNotification = async (rfpData) => {
  // Get selected vendors or all vendors if none selected
  const vendorEmails = rfpData.selectedVendors && rfpData.selectedVendors.length > 0 
    ? rfpData.selectedVendors 
    : process.env.VENDOR_EMAILS.split(',').map(email => email.trim());

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: vendorEmails.join(','),
    subject: `New RFP Submission: ${rfpData.projectTitle}`,
    html: `
      <h2>New RFP Submission Received</h2>
      <p><strong>RFP ID:</strong> ${rfpData._id}</p>
      
      <h3>Company Details</h3>
      <p><strong>Company Name:</strong> ${rfpData.companyName}</p>
      <p><strong>Contact Person:</strong> ${rfpData.contactPerson}</p>
      ${rfpData.email ? `<p><strong>Email:</strong> ${rfpData.email}</p>` : ''}
      <p><strong>Phone:</strong> ${rfpData.phone}</p>
      
      <h3>Project Details</h3>
      <p><strong>Project Title:</strong> ${rfpData.projectTitle}</p>
      <p><strong>Description:</strong> ${rfpData.projectDescription}</p>
      <p><strong>Budget:</strong> $${rfpData.budget}</p>
      <p><strong>Deadline:</strong> ${new Date(rfpData.deadline).toLocaleDateString()}</p>
      <p><strong>Requirements:</strong> ${rfpData.requirements}</p>
      
      <p><strong>Please reply to this email with your proposal.</strong></p>
      <p><strong>Important:</strong> Include the RFP ID (${rfpData._id}) in your reply for automatic processing.</p>
      <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to vendors: ${vendorEmails.join(', ')}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send confirmation email to client
const sendClientConfirmation = async (rfpData) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: rfpData.email,
    subject: `RFP Submission Confirmed: ${rfpData.projectTitle}`,
    html: `
      <h2>Thank you for your RFP submission!</h2>
      <p>Dear ${rfpData.contactPerson},</p>
      <p>We have received your Request for Proposal for <strong>${rfpData.projectTitle}</strong>.</p>
      
      <h3>Submission Details</h3>
      <p><strong>Project Title:</strong> ${rfpData.projectTitle}</p>
      <p><strong>Budget:</strong> $${rfpData.budget}</p>
      <p><strong>Deadline:</strong> ${new Date(rfpData.deadline).toLocaleDateString()}</p>
      
      <p>Our team will review your submission and get back to you shortly.</p>
      
      <p>Best regards,<br>RFP Management Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to client');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

// Send acceptance email to vendor
const sendVendorAcceptanceEmail = async (vendorResponse, rfpData) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: vendorResponse.vendorEmail,
    subject: `🎉 Your Proposal Has Been Accepted: ${rfpData.projectTitle}`,
    html: `
      <h2>Congratulations! Your Proposal Has Been Accepted</h2>
      <p>Dear ${vendorResponse.vendorName},</p>
      
      <p>We are pleased to inform you that your proposal has been accepted for the following RFP:</p>
      
      <h3>Project Details</h3>
      <p><strong>Project Title:</strong> ${rfpData.projectTitle}</p>
      <p><strong>Company:</strong> ${rfpData.companyName}</p>
      <p><strong>Project Description:</strong> ${rfpData.projectDescription}</p>
      
      <h3>Your Proposal</h3>
      ${vendorResponse.proposedPrice ? `<p><strong>Proposed Price:</strong> $${vendorResponse.proposedPrice.toLocaleString()}</p>` : ''}
      ${vendorResponse.timeline ? `<p><strong>Timeline:</strong> ${vendorResponse.timeline}</p>` : ''}
      ${vendorResponse.teamSize ? `<p><strong>Team Size:</strong> ${vendorResponse.teamSize} members</p>` : ''}
      
      ${vendorResponse.aiAnalysis?.analysis?.score ? `
      <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #1E40AF;">AI Analysis Score</h4>
        <p style="font-size: 24px; font-weight: bold; color: #2563EB; margin: 10px 0;">
          ${vendorResponse.aiAnalysis.analysis.score}/100
        </p>
      </div>
      ` : ''}
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Our team will contact you shortly to discuss the project details</li>
        <li>Please prepare any necessary documentation</li>
        <li>We look forward to working with you!</li>
      </ul>
      
      <p>Thank you for your excellent proposal!</p>
      
      <p>Best regards,<br>
      ${rfpData.companyName}<br>
      ${rfpData.contactPerson ? `Contact: ${rfpData.contactPerson}` : ''}<br>
      ${rfpData.phone ? `Phone: ${rfpData.phone}` : ''}</p>
      
      <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
        <em>This is an automated acceptance notification from our RFP Management System.</em>
      </p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Acceptance email sent successfully to vendor: ${vendorResponse.vendorEmail}`);
    return { success: true, message: 'Acceptance email sent' };
  } catch (error) {
    console.error('Error sending acceptance email:', error);
    throw error;
  }
};

module.exports = {
  sendNewRFPNotification,
  sendClientConfirmation,
  sendVendorAcceptanceEmail
};
