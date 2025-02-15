const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get dashboard metrics
router.get('/metrics', dashboardController.getDashboardMetrics);

// Get recent activity
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router; 