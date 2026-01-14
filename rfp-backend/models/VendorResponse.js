const mongoose = require('mongoose');

const vendorResponseSchema = new mongoose.Schema({
  rfpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFP',
    required: true
  },
  vendorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  proposedPrice: {
    type: Number,
    required: false
  },
  timeline: {
    type: String,
    required: false
  },
  experience: {
    type: String,
    required: false
  },
  approach: {
    type: String,
    required: false
  },
  teamSize: {
    type: String
  },
  previousWork: {
    type: String
  },
  notes: {
    type: String
  },
  emailSubject: {
    type: String
  },
  emailBody: {
    type: String
  },
  emailHtml: {
    type: String
  },
  receivedAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  aiAnalysis: {
    analysis: {
      score: Number,
      recommendation: String,
      strengths: [String],
      weaknesses: [String],
      budgetAnalysis: String,
      timelineAnalysis: String,
      riskAssessment: String,
      keyInsights: String,
      structuredDetails: {
        coreCompetencies: [String],
        deliverables: [String],
        specialTerms: String,
        uniqueSellingPoints: [String]
      }
    },
    analyzedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'accepted', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
vendorResponseSchema.index({ rfpId: 1, vendorEmail: 1 });

module.exports = mongoose.model('VendorResponse', vendorResponseSchema);
