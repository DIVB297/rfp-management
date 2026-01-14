const express = require('express');
const router = express.Router();
const { syncEmails, getInboxStats } = require('../utils/imapService');

// Sync emails from inbox
router.post('/sync', async (req, res) => {
  try {
    console.log('Starting email sync...');
    const results = await syncEmails();
    
    res.json({
      success: true,
      message: 'Email sync completed',
      data: results
    });
  } catch (error) {
    console.error('Error syncing emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync emails',
      error: error.message
    });
  }
});

// Get inbox statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getInboxStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting inbox stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inbox statistics',
      error: error.message
    });
  }
});

module.exports = router;
