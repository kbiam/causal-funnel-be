create database causalfunnel;
use causalfunnel;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
select * from answers;

CREATE TABLE quiz_sessions (
  session_id VARCHAR(36) PRIMARY KEY, -- UUID
  user_id INT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(36),
  question TEXT NOT NULL,
  correct_ans TEXT NOT NULL,
  options_json TEXT NOT NULL, -- Store shuffled options as JSON string
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id)
);


CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  selected_ans TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);



