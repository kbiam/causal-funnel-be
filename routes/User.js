const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Check user's current status and allow resuming in-progress tests
router.get('/:email/current', UserController.getCurrentStatus);

// Get user's test history
router.get('/:email/history', UserController.getTestHistory);

// Get detailed report for a specific test
router.get('/:email/report/:sessionId', UserController.getDetailedReport);

module.exports = router;