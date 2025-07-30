const QuizSession = require('../models/QuizSession');

const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await QuizSession.getAllSubmissions();

    const totalSubmissions = submissions.length;
    const averageScore = totalSubmissions > 0
      ? submissions.reduce((sum, sub) => sum + sub.score, 0) / totalSubmissions
      : 0;

    const averagePercentage = totalSubmissions > 0
      ? submissions.reduce((sum, sub) => sum + sub.percentage, 0) / totalSubmissions
      : 0;

    res.json({
      totalSubmissions,
      averageScore,
      averagePercentage,
      submissions
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getSubmissions };
