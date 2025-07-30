const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const QuestionService = require('../services/QuestionService');
const ValidationService = require('../services/ValidationService');

async function startQuiz(req, res, next) {
  try {
    const { email } = req.body;

    const emailValidation = ValidationService.validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        error: emailValidation.error,
        code: emailValidation.code
      });
    }

    const questions = await QuestionService.fetchQuestions();

    const sessionId = uuidv4();
    const userId = await User.createOrGetUser(email.trim().toLowerCase());
    await QuizSession.createQuizSession(sessionId, userId);
    await Question.saveMultiple(sessionId, questions);

    const savedSession = await QuizSession.getQuizSession(sessionId);

    const publicQuestions = savedSession.questions.map(q => ({
      id: q.id,
      question: q.question,
      choices: q.choices,
      category: q.category || 'General Knowledge',
      difficulty: q.difficulty || 'medium'
    }));

    res.json({
      sessionId,
      questions: publicQuestions,
      timeLimit: 30 * 60,
      message: 'Quiz session started successfully'
    });

  } catch (error) {
    next(error);
  }
}

async function getQuizSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await QuizSession.getQuizSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Quiz session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    const { isExpired, timeRemaining } = ValidationService.checkSessionExpiry(
      session.startTime,
      session.timeLimit
    );

    const answeredCount = Object.keys(session.answers).length;
    const isCompleted = answeredCount === session.questions.length;

    const response = {
      sessionId: session.sessionId,
      email: session.email,
      startTime: session.startTime,
      timeLimit: session.timeLimit,
      timeRemaining,
      expired: isExpired,
      completed: isCompleted,
      answeredCount,
      totalQuestions: session.questions.length
    };

    if (isCompleted || isExpired) {
      const results = await QuizSession.getQuizResults(sessionId);
      response.results = results.results;
      response.score = results.score;
      response.percentage = Math.round((results.score / results.totalQuestions) * 100);
    } else {
      response.questions = session.questions.map(q => ({
        id: q.id,
        question: q.question,
        choices: q.choices,
        answered: session.answers.hasOwnProperty(q.id),
        userAnswer: session.answers[q.id] || null
      }));
    }

    res.json(response);

  } catch (error) {
    next(error);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { questionId, answer } = req.body;

    const session = await QuizSession.getQuizSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Quiz session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    const { isExpired, timeRemaining } = ValidationService.checkSessionExpiry(
      session.startTime,
      session.timeLimit
    );

    if (isExpired) {
      return res.status(400).json({
        error: 'Quiz time has expired',
        code: 'QUIZ_EXPIRED'
      });
    }

    const question = session.questions.find(q => q.id === parseInt(questionId));
    if (!question) {
      return res.status(400).json({
        error: 'Invalid question ID',
        code: 'INVALID_QUESTION_ID'
      });
    }

    const answerValidation = ValidationService.validateAnswer(question, answer);
    if (!answerValidation.valid) {
      return res.status(400).json({
        error: answerValidation.error,
        code: answerValidation.code
      });
    }

    await Answer.saveAnswer(questionId, answer);

    res.json({
      message: 'Answer saved successfully',
      questionId: parseInt(questionId),
      answer,
      timeRemaining
    });

  } catch (error) {
    next(error);
  }
}

async function getResults(req, res, next) {
  try {
    const { sessionId } = req.params;
    const results = await QuizSession.getQuizResults(sessionId);

    if (!results) {
      return res.status(404).json({
        error: 'Quiz session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      sessionId: results.sessionId,
      email: results.email,
      score: results.score,
      totalQuestions: results.totalQuestions,
      percentage: Math.round((results.score / results.totalQuestions) * 100),
      startTime: results.startTime,
      results: results.results
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  startQuiz,
  getQuizSession,
  submitAnswer,
  getResults
};
