const { decodeHtmlEntities, shuffleArray } = require('../utils/Helpers');
const { fallbackQuestions } = require('../utils/FallbackQuestions');

async function fetchQuestions() {
  let questions = [];

  try {
    console.log('Fetching questions from OpenTDB API...');
    const res = await fetch('https://opentdb.com/api.php?amount=15&type=multiple', {
      timeout: 10000,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (data?.results?.length === 15) {
      questions = data.results.map((q) => ({
        question: decodeHtmlEntities(q.question),
        correct_answer: decodeHtmlEntities(q.correct_answer),
        choices: shuffleArray([
          decodeHtmlEntities(q.correct_answer),
          ...q.incorrect_answers.map(decodeHtmlEntities)
        ]),
        category: q.category,
        difficulty: q.difficulty,
      }));
      console.log('Successfully fetched questions from OpenTDB API');
    } else {
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.log('OpenTDB API failed, using fallback questions:', error.message);
    questions = fallbackQuestions.slice(0, 15).map((q) => ({
      question: q.question,
      correct_answer: q.correct_answer,
      choices: shuffleArray([q.correct_answer, ...q.incorrect_answers]),
      category: 'General Knowledge',
      difficulty: 'medium',
    }));
  }

  return questions;
}

module.exports = { fetchQuestions };
