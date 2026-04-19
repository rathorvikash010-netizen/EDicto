/**
 * Application-wide constants
 */

const CATEGORIES = ['GRE', 'IELTS', 'Business'];

const DIFFICULTY_RANGE = { min: 1, max: 5 };

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

const ACTIVITY_ACTIONS = [
  'bookmarked',
  'removed bookmark',
  'learned',
  'reviewed',
  'completed quiz',
  'added to revision',
  'removed from revision',
  'searched',
];

const LIMITS = {
  MAX_ACTIVITIES: 100,
  MAX_QUIZ_RESULTS: 50,
  MAX_REVISION_INTERVAL: 30,
  QUIZ_QUESTION_COUNT: 5,
  QUIZ_OPTIONS_COUNT: 4,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DAILY_WORDS_PER_PAGE: 6,
  DAILY_WORDS_FETCH_COUNT: 60,
  DAILY_WORD_RETENTION_DAYS: 10,
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

module.exports = {
  CATEGORIES,
  DIFFICULTY_RANGE,
  ROLES,
  ACTIVITY_ACTIONS,
  LIMITS,
  COOKIE_OPTIONS,
};
