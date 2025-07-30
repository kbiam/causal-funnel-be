const express = require('express');
const QuizController = require('../controllers/QuizController');

const router = express.Router();

// Start a new quiz session
router.post('/start', QuizController.startQuiz);

// Get quiz session details
router.get('/:sessionId', QuizController.getQuizSession);

// Submit answer for a question
router.post('/:sessionId/answer', QuizController.submitAnswer);

// Get quiz results
router.get('/:sessionId/results', QuizController.getResults);

module.exports = router;