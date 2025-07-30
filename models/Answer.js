const db = require('../config/db'); // 

async function saveAnswer(questionId, selectedAnswer) {
  try {
    const [results] = await db.query(
      'SELECT id FROM answers WHERE question_id = ?',
      [questionId]
    );

    if (results.length > 0) {
      // Answer exists, update it
      await db.query(
        'UPDATE answers SET selected_ans = ? WHERE question_id = ?',
        [selectedAnswer, questionId]
      );
    } else {
      // Insert new answer
      await db.query(
        'INSERT INTO answers (question_id, selected_ans) VALUES (?, ?)',
        [questionId, selectedAnswer]
      );
    }

    return; 
  } catch (err) {
    throw err;
  }
}

module.exports = {saveAnswer};
