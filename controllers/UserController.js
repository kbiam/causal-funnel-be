const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const ValidationService = require('../services/ValidationService');

async function getCurrentStatus(req, res, next) {
  try {
    const { email } = req.params;

    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        error: emailValidation.error,
        code: emailValidation.code
      });
    }

    const history = await User.getTestHistory(email.trim().toLowerCase());
    const inProgressTest = history.find(h => h.status === 'in_progress');

    if (inProgressTest) {
      const session = await QuizSession.getQuizSession(inProgressTest.sessionId);
      const { timeRemaining } = ValidationService.checkSessionExpiry(
        session.startTime,
        session.timeLimit
      );

      res.json({
        hasInProgressTest: true,
        sessionId: inProgressTest.sessionId,
        startTime: inProgressTest.startTime,
        answeredQuestions: inProgressTest.answeredQuestions,
        totalQuestions: inProgressTest.totalQuestions,
        timeRemaining,
        canResume: timeRemaining > 0
      });
    } else {
      res.json({
        hasInProgressTest: false,
        canStartNew: true,
        lastTestDate: history.length > 0 ? history[0].startTime : null
      });
    }

  } catch (error) {
    next(error);
  }
}

async function getTestHistory(req, res, next) {
  try {
    const { email } = req.params;

    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        error: emailValidation.error,
        code: emailValidation.code
      });
    }

    const history = await User.getTestHistory(email.trim().toLowerCase());

    res.json({
      email: email.trim().toLowerCase(),
      totalTests: history.length,
      completedTests: history.filter(h => h.status === 'completed').length,
      inProgressTests: history.filter(h => h.status === 'in_progress').length,
      expiredTests: history.filter(h => h.status === 'expired').length,
      history
    });

  } catch (error) {
    next(error);
  }
}

async function getDetailedReport(req, res, next) {
  try {
    const { email, sessionId } = req.params;

    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        error: emailValidation.error,
        code: emailValidation.code
      });
    }

    const session = await QuizSession.getQuizSession(sessionId);
    if (!session || session.email !== email.trim().toLowerCase()) {
      return res.status(404).json({
        error: 'Test report not found or access denied',
        code: 'REPORT_NOT_FOUND'
      });
    }

    const { isExpired, elapsed } = ValidationService.checkSessionExpiry(
      session.startTime,
      session.timeLimit
    );
    const answeredCount = Object.keys(session.answers).length;
    const isCompleted = answeredCount === session.questions.length;

    if (!isCompleted && !isExpired) {
      return res.status(400).json({
        error: 'Test is still in progress',
        code: 'TEST_IN_PROGRESS'
      });
    }

    const results = await QuizSession.getQuizResults(sessionId);
    if (!results) {
      return res.status(404).json({
        error: 'Test results not found',
        code: 'RESULTS_NOT_FOUND'
      });
    }

    const categoryStats = {};
    const difficultyStats = {};

    results.results.forEach(result => {
      const category = 'General Knowledge';
      const difficulty = 'medium';

      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0 };
      }
      categoryStats[category].total++;
      if (result.isCorrect) categoryStats[category].correct++;

      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { total: 0, correct: 0 };
      }
      difficultyStats[difficulty].total++;
      if (result.isCorrect) difficultyStats[difficulty].correct++;
    });

    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].percentage = Math.round(
        (categoryStats[category].correct / categoryStats[category].total) * 100
      );
    });

    Object.keys(difficultyStats).forEach(difficulty => {
      difficultyStats[difficulty].percentage = Math.round(
        (difficultyStats[difficulty].correct / difficultyStats[difficulty].total) * 100
      );
    });

    res.json({
      sessionId: results.sessionId,
      email: results.email,
      startTime: results.startTime,
      completedTime: isCompleted ? new Date() : null,
      status: isCompleted ? 'completed' : 'expired',
      score: results.score,
      totalQuestions: results.totalQuestions,
      percentage: Math.round((results.score / results.totalQuestions) * 100),
      timeTaken: elapsed,
      categoryStats,
      difficultyStats,
      results: results.results,
      summary: {
        correct: results.score,
        incorrect: results.totalQuestions - results.score,
        unanswered: results.totalQuestions - answeredCount,
        accuracy: Math.round((results.score / results.totalQuestions) * 100)
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentStatus,
  getTestHistory,
  getDetailedReport
};



