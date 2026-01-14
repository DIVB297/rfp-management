const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const RFP = require('../models/RFP');
const { sendNewRFPNotification } = require('../utils/emailService');

// @route   GET /api/rfps/vendors
// @desc    Get list of available vendors
// @access  Public
router.get('/vendors', (req, res) => {
  try {
    const vendors = process.env.VENDOR_EMAILS.split(',').map(email => email.trim());
    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
});

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// @route   POST /api/rfps
// @desc    Submit a new RFP
// @access  Public
router.post('/', upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      projectTitle,
      projectDescription,
      budget,
      deadline,
      requirements,
      selectedVendors
    } = req.body;

    // Prepare attachments data
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Parse selectedVendors if it's a string (from FormData)
    const vendorsArray = typeof selectedVendors === 'string' 
      ? JSON.parse(selectedVendors) 
      : selectedVendors;

    // Create new RFP
    const rfp = new RFP({
      companyName,
      contactPerson,
      email,
      phone,
      projectTitle,
      projectDescription,
      budget,
      deadline,
      requirements,
      attachments,
      selectedVendors: vendorsArray
    });

    await rfp.save();

    // Send email notifications to vendors
    try {
      await sendNewRFPNotification(rfp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'RFP submitted successfully',
      data: rfp
    });
  } catch (error) {
    console.error('Error submitting RFP:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting RFP',
      error: error.message
    });
  }
});

// @route   GET /api/rfps
// @desc    Get all RFPs with vendor response counts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const VendorResponse = require('../models/VendorResponse');
    const rfps = await RFP.find().sort({ submittedAt: -1 });
    
    // Get response counts for each RFP
    const rfpsWithCounts = await Promise.all(
      rfps.map(async (rfp) => {
        const responseCount = await VendorResponse.countDocuments({ rfpId: rfp._id });
        const acceptedCount = await VendorResponse.countDocuments({ 
          rfpId: rfp._id, 
          status: 'accepted' 
        });
        return {
          ...rfp.toObject(),
          responseCount,
          acceptedCount
        };
      })
    );
    
    res.json({
      success: true,
      count: rfpsWithCounts.length,
      data: rfpsWithCounts
    });
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RFPs',
      error: error.message
    });
  }
});

// @route   GET /api/rfps/:id
// @desc    Get single RFP by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id);
    
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    res.json({
      success: true,
      data: rfp
    });
  } catch (error) {
    console.error('Error fetching RFP:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RFP',
      error: error.message
    });
  }
});

// @route   PUT /api/rfps/:id/status
// @desc    Update RFP status
// @access  Public
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'closed', 'accepted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const rfp = await RFP.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: 'RFP not found'
      });
    }

    res.json({
      success: true,
      message: 'RFP status updated',
      data: rfp
    });
  } catch (error) {
    console.error('Error updating RFP status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating RFP status',
      error: error.message
    });
  }
});

module.exports = router;
