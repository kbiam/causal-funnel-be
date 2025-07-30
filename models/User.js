const db = require('../config/db');

async function createOrGetUser(email) {
  const [results] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

  if (results.length > 0) {
    return results[0].id;
  }

  const [insertResult] = await db.query('INSERT INTO users (email) VALUES (?)', [email]);
  return insertResult.insertId;
}

async function getTestHistory(email) {
  const sql = `
    SELECT 
      qs.session_id,
      qs.started_at,
      COUNT(q.id) as total_questions,
      COUNT(a.selected_ans) as answered_questions,
      SUM(CASE WHEN a.selected_ans = q.correct_ans THEN 1 ELSE 0 END) as correct_answers,
      CASE 
        WHEN COUNT(a.selected_ans) = COUNT(q.id) THEN 'completed'
        WHEN TIMESTAMPDIFF(MINUTE, qs.started_at, NOW()) > 30 THEN 'expired'
        ELSE 'in_progress'
      END as status
    FROM quiz_sessions qs
    JOIN users u ON qs.user_id = u.id
    JOIN questions q ON qs.session_id = q.session_id
    LEFT JOIN answers a ON q.id = a.question_id
    WHERE u.email = ?
    GROUP BY qs.session_id, qs.started_at
    ORDER BY qs.started_at DESC
  `;

  const [results] = await db.query(sql, [email]);

  return results.map(row => ({
    sessionId: row.session_id,
    startTime: row.started_at,
    status: row.status,
    totalQuestions: parseInt(row.total_questions),
    answeredQuestions: parseInt(row.answered_questions),
    score: row.status === 'completed' ? parseInt(row.correct_answers) : null,
    percentage: row.status === 'completed'
      ? Math.round((row.correct_answers / row.total_questions) * 100)
      : null,
    canResume: row.status === 'in_progress'
  }));
}

module.exports = {
  createOrGetUser,
  getTestHistory
};
