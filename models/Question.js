const db = require('../config/db'); 

async function saveMultiple(sessionId, questions) {
  const connection = await db.getConnection(); 

  try {
    await connection.beginTransaction();

    for (const question of questions) {
      const sql = `INSERT INTO questions 
        (session_id, question, correct_ans, options_json) 
        VALUES (?, ?, ?, ?)`;

      const values = [
        sessionId,
        question.question,
        question.correct_answer,
        JSON.stringify(question.choices),
      ];

      await connection.query(sql, values);
    }

    await connection.commit();
    connection.release(); 
  } catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
  }
}


module.exports = {saveMultiple};
