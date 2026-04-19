const DailyWord = require('../models/DailyWord');
const { LIMITS } = require('../constants');

/**
 * Generate a quiz with shuffled MCQ questions from stored DailyWord documents.
 * Each question has 1 correct answer + 3 random wrong answers.
 * Returns exactly QUIZ_QUESTION_COUNT (5) questions with no repetition.
 */
async function generateQuiz(count = LIMITS.QUIZ_QUESTION_COUNT) {
  // Get all available daily words
  const allWords = await DailyWord.find().lean();

  if (allWords.length < LIMITS.QUIZ_OPTIONS_COUNT) {
    throw new Error('Not enough words in database to generate a quiz. Need at least 4 words.');
  }

  // Cap the count to available words
  const questionCount = Math.min(count, allWords.length);

  // Shuffle and pick unique words for questions
  const shuffled = [...allWords].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, questionCount);

  const questions = selected.map((word) => {
    // Get 3 random wrong definitions from other words
    const wrongAnswers = allWords
      .filter((w) => w._id.toString() !== word._id.toString())
      .sort(() => 0.5 - Math.random())
      .slice(0, LIMITS.QUIZ_OPTIONS_COUNT - 1)
      .map((w) => w.definition);

    // Combine correct + wrong answers and shuffle
    const options = [...wrongAnswers, word.definition].sort(() => 0.5 - Math.random());
    const correctIndex = options.indexOf(word.definition);

    return {
      wordId: word._id,
      word: word.word,
      options,
      correctIndex,
    };
  });

  return questions;
}

module.exports = { generateQuiz };
