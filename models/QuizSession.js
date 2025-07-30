const db = require('../config/db');

async function createQuizSession(sessionId, userId) {
  await db.query(
    'INSERT INTO quiz_sessions (session_id, user_id) VALUES (?, ?)',
    [sessionId, userId]
  );
}

async function getQuizSession(sessionId) {
  const [sessionRows] = await db.query(`
    SELECT qs.session_id, qs.started_at, u.email 
    FROM quiz_sessions qs 
    JOIN users u ON qs.user_id = u.id 
    WHERE qs.session_id = ?
  `, [sessionId]);

  if (sessionRows.length === 0) return null;

  const session = sessionRows[0];

  const [questionRows] = await db.query(`
    SELECT id, question, correct_ans, options_json 
    FROM questions 
    WHERE session_id = ? 
    ORDER BY id
  `, [sessionId]);

  const [answerRows] = await db.query(`
    SELECT q.id as question_id, a.selected_ans 
    FROM questions q 
    LEFT JOIN answers a ON q.id = a.question_id 
    WHERE q.session_id = ?
  `, [sessionId]);

  const answers = {};
  answerRows.forEach(row => {
    if (row.selected_ans) {
      answers[row.question_id] = row.selected_ans;
    }
  });

  const questions = questionRows.map(q => ({
    id: q.id,
    question: q.question,
    correct_answer: q.correct_ans,
    choices: JSON.parse(q.options_json),
  }));

  return {
    sessionId: session.session_id,
    email: session.email,
    startTime: session.started_at,
    questions,
    answers,
    timeLimit: 30 * 60 * 1000 // 30 minutes
  };
}

// Get results for a session
async function getQuizResults(sessionId) {
  const [rows] = await db.query(`
    SELECT 
      q.id as question_id,
      q.question,
      q.correct_ans,
      q.options_json,
      a.selected_ans,
      qs.started_at,
      u.email
    FROM questions q
    LEFT JOIN answers a ON q.id = a.question_id
    JOIN quiz_sessions qs ON q.session_id = qs.session_id
    JOIN users u ON qs.user_id = u.id
    WHERE q.session_id = ?
    ORDER BY q.id
  `, [sessionId]);

  if (rows.length === 0) return null;

  const results = rows.map(row => ({
    questionId: row.question_id,
    question: row.question,
    choices: JSON.parse(row.options_json),
    userAnswer: row.selected_ans,
    correctAnswer: row.correct_ans,
    isCorrect: row.selected_ans === row.correct_ans
  }));

  const score = results.filter(r => r.isCorrect).length;

  return {
    sessionId,
    email: rows[0].email,
    startTime: rows[0].started_at,
    results,
    score,
    totalQuestions: results.length
  };
}

// Get all quiz submissions
async function getAllSubmissions() {
  const [rows] = await db.query(`
    SELECT 
      qs.session_id,
      u.email,
      qs.started_at,
      COUNT(q.id) as total_questions,
      SUM(CASE WHEN a.selected_ans = q.correct_ans THEN 1 ELSE 0 END) as correct_answers
    FROM quiz_sessions qs
    JOIN users u ON qs.user_id = u.id
    JOIN questions q ON qs.session_id = q.session_id
    LEFT JOIN answers a ON q.id = a.question_id
    WHERE a.selected_ans IS NOT NULL
    GROUP BY qs.session_id, u.email, qs.started_at
    ORDER BY qs.started_at DESC
  `);

  return rows.map(row => ({
    sessionId: row.session_id,
    email: row.email,
    startTime: row.started_at,
    score: parseInt(row.correct_answers),
    totalQuestions: parseInt(row.total_questions),
    percentage: Math.round((row.correct_answers / row.total_questions) * 100)
  }));
}

module.exports = {
  createQuizSession,
  getQuizSession,
  getQuizResults,
  getAllSubmissions
};
