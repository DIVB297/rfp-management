const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const VendorResponse = require('../models/VendorResponse');
const RFP = require('../models/RFP');
const { analyzeVendorResponse, compareVendorResponses } = require('../utils/aiAnalysis');
const { sendVendorAcceptanceEmail } = require('../utils/emailService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only document files are allowed'));
  }
});

// @route   POST /api/vendor-responses
// @desc    Submit a vendor response to an RFP
// @access  Public
router.post('/', upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      rfpId,
      vendorEmail,
      vendorName,
      proposedPrice,
      timeline,
      experience,
      approach,
      teamSize,
      previousWork,
      notes
    } = req.body;

    // Check if RFP exists
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    // Check if vendor was invited
    if (rfp.selectedVendors && rfp.selectedVendors.length > 0) {
      if (!rfp.selectedVendors.includes(vendorEmail.toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: 'Vendor not invited to respond to this RFP'
        });
      }
    }

    // Prepare attachments data
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Create vendor response
    const vendorResponse = new VendorResponse({
      rfpId,
      vendorEmail: vendorEmail.toLowerCase(),
      vendorName,
      proposedPrice,
      timeline,
      experience,
      approach,
      teamSize,
      previousWork,
      notes,
      attachments
    });

    await vendorResponse.save();

    // Trigger AI analysis in background
    analyzeVendorResponse(rfp, vendorResponse)
      .then(async (analysis) => {
        vendorResponse.aiAnalysis = analysis;
        vendorResponse.status = 'analyzed';
        await vendorResponse.save();
        console.log(`AI analysis completed for vendor: ${vendorEmail}`);
      })
      .catch(error => {
        console.error('Background AI analysis failed:', error);
      });

    res.status(201).json({
      success: true,
      message: 'Vendor response submitted successfully. AI analysis in progress.',
      data: vendorResponse
    });
  } catch (error) {
    console.error('Error submitting vendor response:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting vendor response',
      error: error.message
    });
  }
});

// @route   GET /api/vendor-responses
// @desc    Get all vendor responses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const responses = await VendorResponse.find()
      .populate('rfpId', 'projectTitle companyName')
      .sort({ receivedAt: -1, submittedAt: -1 });
    
    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    console.error('Error fetching all vendor responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor responses',
      error: error.message
    });
  }
});

// @route   GET /api/vendor-responses/rfp/:rfpId
// @desc    Get all vendor responses for an RFP
// @access  Public
router.get('/rfp/:rfpId', async (req, res) => {
  try {
    const responses = await VendorResponse.find({ rfpId: req.params.rfpId })
      .sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    console.error('Error fetching vendor responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor responses',
      error: error.message
    });
  }
});

// @route   GET /api/vendor-responses/:id
// @desc    Get single vendor response
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const response = await VendorResponse.findById(req.params.id).populate('rfpId');
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Vendor response not found'
      });
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching vendor response:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor response',
      error: error.message
    });
  }
});

// @route   POST /api/vendor-responses/:id/analyze
// @desc    Re-analyze a vendor response
// @access  Public
router.post('/:id/analyze', async (req, res) => {
  try {
    const vendorResponse = await VendorResponse.findById(req.params.id);
    if (!vendorResponse) {
      return res.status(404).json({
        success: false,
        message: 'Vendor response not found'
      });
    }

    const rfp = await RFP.findById(vendorResponse.rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'Associated RFP not found'
      });
    }

    const analysis = await analyzeVendorResponse(rfp, vendorResponse);
    
    vendorResponse.aiAnalysis = analysis;
    vendorResponse.status = 'analyzed';
    await vendorResponse.save();

    res.json({
      success: true,
      message: 'AI analysis completed',
      data: vendorResponse
    });
  } catch (error) {
    console.error('Error analyzing vendor response:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing vendor response',
      error: error.message
    });
  }
});

// @route   POST /api/vendor-responses/compare/:rfpId
// @desc    Compare all vendor responses for an RFP
// @access  Public
router.post('/compare/:rfpId', async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    const vendorResponses = await VendorResponse.find({ 
      rfpId: req.params.rfpId,
      status: 'analyzed'
    });

    if (vendorResponses.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 analyzed vendor responses required for comparison'
      });
    }

    const comparison = await compareVendorResponses(rfp, vendorResponses);

    res.json({
      success: true,
      message: 'Vendor comparison completed',
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing vendor responses:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing vendor responses',
      error: error.message
    });
  }
});

// @route   PUT /api/vendor-responses/:id/status
// @desc    Update vendor response status
// @access  Public
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'analyzed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const vendorResponse = await VendorResponse.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!vendorResponse) {
      return res.status(404).json({
        success: false,
        message: 'Vendor response not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated',
      data: vendorResponse
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

// @route   POST /api/vendor-responses/:id/accept
// @desc    Accept a vendor response and send notification email
// @access  Public
router.post('/:id/accept', async (req, res) => {
  try {
    const vendorResponse = await VendorResponse.findById(req.params.id);
    
    if (!vendorResponse) {
      return res.status(404).json({
        success: false,
        message: 'Vendor response not found'
      });
    }

    // Get the RFP details
    const rfp = await RFP.findById(vendorResponse.rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'Associated RFP not found'
      });
    }

    // Update vendor response status to accepted
    vendorResponse.status = 'accepted';
    await vendorResponse.save();

    // Update RFP status to accepted
    rfp.status = 'accepted';
    await rfp.save();

    // Send acceptance email to vendor
    try {
      await sendVendorAcceptanceEmail(vendorResponse, rfp);
    } catch (emailError) {
      console.error('Failed to send acceptance email:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Vendor response accepted and notification email sent',
      data: vendorResponse
    });
  } catch (error) {
    console.error('Error accepting vendor response:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting vendor response',
      error: error.message
    });
  }
});

// @route   GET /api/vendor-responses/attachment/:filePath
// @desc    Download attachment file
// @access  Public
router.get('/attachment/:filePath(*)', async (req, res) => {
  try {
    const fs = require('fs');
    const filePath = decodeURIComponent(req.params.filePath);
    
    // Security check - ensure the path is within uploads directory
    const absolutePath = path.resolve(filePath);
    const uploadsPath = path.resolve(__dirname, '../uploads');
    
    if (!absolutePath.startsWith(uploadsPath)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file stats
    const stat = fs.statSync(absolutePath);
    const filename = path.basename(absolutePath);

    // Set headers for download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stat.size);

    // Stream the file
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading attachment',
      error: error.message
    });
  }
});

module.exports = router;
