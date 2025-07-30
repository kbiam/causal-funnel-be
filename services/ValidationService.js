function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required', code: 'MISSING_EMAIL' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please provide a valid email address', code: 'INVALID_EMAIL' };
  }

  return { valid: true };
}

function validateAnswer(question, answer) {
  if (!question.choices.includes(answer)) {
    return { valid: false, error: 'Invalid answer choice', code: 'INVALID_ANSWER' };
  }

  return { valid: true };
}

function checkSessionExpiry(startTime, timeLimit) {
  const now = new Date();
  const elapsed = now - new Date(startTime);
  const isExpired = elapsed > timeLimit;
  const timeRemaining = Math.max(0, timeLimit - elapsed);

  return { isExpired, timeRemaining, elapsed };
}

module.exports = {
  validateEmail,
  validateAnswer,
  checkSessionExpiry
};
