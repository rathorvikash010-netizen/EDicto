/**
 * UserWord Service
 * 
 * Manages per-user word storage: bookmarks, revision list.
 * Words are stored with full data so they survive shared word expiry.
 */

const UserWord = require('../models/UserWord');

/**
 * Save or update a word in the user's personal collection.
 */
async function saveWord(userId, wordData, flags = {}) {
  const { isBookmarked, isRevision, sourceType } = flags;

  const existing = await UserWord.findOne({ userId, word: wordData.word });

  if (existing) {
    // Update flags — only set to true, never overwrite true with false
    if (isBookmarked) existing.isBookmarked = true;
    if (isRevision) existing.isRevision = true;
    if (sourceType) existing.sourceType = sourceType;
    await existing.save();
    return existing;
  }

  return UserWord.create({
    userId,
    word: wordData.word,
    partOfSpeech: wordData.partOfSpeech || '',
    definition: wordData.definition || wordData.meaning || '',
    pronunciation: wordData.pronunciation || '',
    example: wordData.example || '',
    synonyms: wordData.synonyms || [],
    antonyms: wordData.antonyms || [],
    sourceType: sourceType || 'bookmark',
    isBookmarked: !!isBookmarked,
    isRevision: !!isRevision,
    savedAt: new Date(),
  });
}

/**
 * Toggle bookmark on a word. Creates UserWord if it doesn't exist.
 */
async function toggleBookmark(userId, wordData) {
  const existing = await UserWord.findOne({ userId, word: wordData.word });

  if (existing) {
    existing.isBookmarked = !existing.isBookmarked;

    // If both flags are off, delete the document
    if (!existing.isBookmarked && !existing.isRevision) {
      await UserWord.deleteOne({ _id: existing._id });
      return { removed: true, word: wordData.word };
    }

    await existing.save();
    return existing;
  }

  // Create new entry with bookmark
  return saveWord(userId, wordData, { isBookmarked: true, sourceType: 'bookmark' });
}

/**
 * Toggle revision on a word. Creates UserWord if it doesn't exist.
 */
async function toggleRevision(userId, wordData) {
  const existing = await UserWord.findOne({ userId, word: wordData.word });

  if (existing) {
    existing.isRevision = !existing.isRevision;

    // If both flags are off, delete the document
    if (!existing.isBookmarked && !existing.isRevision) {
      await UserWord.deleteOne({ _id: existing._id });
      return { removed: true, word: wordData.word };
    }

    await existing.save();
    return existing;
  }

  // Create new entry with revision
  return saveWord(userId, wordData, { isRevision: true, sourceType: 'revision' });
}

/**
 * Get all bookmarked words for a user.
 */
async function getBookmarks(userId) {
  return UserWord.find({ userId, isBookmarked: true })
    .sort({ savedAt: -1 })
    .lean();
}

/**
 * Get all revision words for a user.
 */
async function getRevisionWords(userId) {
  return UserWord.find({ userId, isRevision: true })
    .sort({ savedAt: -1 })
    .lean();
}

/**
 * Remove bookmark from a word.
 */
async function removeBookmark(userId, word) {
  const existing = await UserWord.findOne({ userId, word });
  if (!existing) return null;

  existing.isBookmarked = false;

  if (!existing.isBookmarked && !existing.isRevision) {
    await UserWord.deleteOne({ _id: existing._id });
    return { removed: true, word };
  }

  await existing.save();
  return existing;
}

/**
 * Remove revision from a word.
 */
async function removeRevision(userId, word) {
  const existing = await UserWord.findOne({ userId, word });
  if (!existing) return null;

  existing.isRevision = false;

  if (!existing.isBookmarked && !existing.isRevision) {
    await UserWord.deleteOne({ _id: existing._id });
    return { removed: true, word };
  }

  await existing.save();
  return existing;
}

/**
 * Check bookmark/revision status for a word.
 */
async function getWordStatus(userId, word) {
  const existing = await UserWord.findOne({ userId, word }).lean();
  return {
    isBookmarked: existing ? existing.isBookmarked : false,
    isRevision: existing ? existing.isRevision : false,
  };
}

module.exports = {
  saveWord,
  toggleBookmark,
  toggleRevision,
  getBookmarks,
  getRevisionWords,
  removeBookmark,
  removeRevision,
  getWordStatus,
};
