const express = require('express');
const quizRoutes = require('./Quiz');
const userRoutes = require('./User');
const adminRoutes = require('./Admin');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Quiz API is running with MySQL database'
  });
});

// Routes
router.use('/quiz', quizRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;