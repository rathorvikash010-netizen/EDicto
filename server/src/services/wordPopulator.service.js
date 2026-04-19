/**
 * Word Populator Service
 * 
 * - On startup: fetches the FIRST 50 words from Free Dictionary API → stores in DB
 * - When user has seen all words: fetches the NEXT 50 from the list
 * - Words are fetched LIVE from https://dictionaryapi.dev/
 * - DB only caches the fetched data
 */

const Word = require('../models/Word');
const { fetchWord } = require('./dictionary.service');
const { WORD_LIST, BATCH_SIZE } = require('../constants/wordList');

/**
 * On startup: ensure at least 50 words are in the database.
 * If DB is empty, fetch the first 50 from the Free Dictionary API.
 * If DB has some words, fetch until we have a full batch.
 */
async function populateWords() {
  const currentCount = await Word.countDocuments();
  console.log(`\n📡 Word database check: ${currentCount} words currently in DB`);

  if (currentCount >= BATCH_SIZE) {
    console.log(`✅ Already have ${currentCount} words (>= ${BATCH_SIZE}). Ready to go!\n`);
    return;
  }

  // Figure out which words from the list are NOT yet in DB
  const existingWords = await Word.find().select('word').lean();
  const existingSet = new Set(existingWords.map((w) => w.word.toLowerCase()));

  const missing = WORD_LIST.filter((item) => !existingSet.has(item.word.toLowerCase()));
  const toFetch = missing.slice(0, BATCH_SIZE - currentCount);

  if (toFetch.length === 0) {
    console.log('✅ No new words to fetch.\n');
    return;
  }

  console.log(`📥 Fetching ${toFetch.length} words from Free Dictionary API...\n`);
  await fetchAndSaveWords(toFetch);
}

/**
 * Called when user has seen/learned all current words.
 * Fetches the NEXT 50 words from the master list that aren't in DB yet.
 * Returns the count of newly added words.
 */
async function fetchNextBatch() {
  const existingWords = await Word.find().select('word').lean();
  const existingSet = new Set(existingWords.map((w) => w.word.toLowerCase()));

  // Find words from master list not yet in DB
  const remaining = WORD_LIST.filter((item) => !existingSet.has(item.word.toLowerCase()));

  if (remaining.length === 0) {
    return { added: 0, message: 'All words from the curriculum have been loaded!' };
  }

  const FETCH_MORE_SIZE = 30;
  const toFetch = remaining.slice(0, FETCH_MORE_SIZE);
  console.log(`\n📥 Fetching next batch: ${toFetch.length} words from Free Dictionary API...\n`);

  const result = await fetchAndSaveWords(toFetch);
  const total = await Word.countDocuments();

  return {
    added: result.inserted,
    failed: result.failed,
    totalInDB: total,
    remainingInList: remaining.length - toFetch.length,
  };
}

/**
 * Internal: fetch an array of words from the API and save to DB.
 */
async function fetchAndSaveWords(wordItems) {
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < wordItems.length; i++) {
    const meta = wordItems[i];
    const progress = `[${i + 1}/${wordItems.length}]`;

    try {
      const result = await fetchWord(meta.word, {
        category: meta.category,
        difficulty: meta.difficulty,
      });

      if (result.error) {
        console.log(`${progress} ⚠️  ${meta.word}: ${result.error}`);
        failed++;
        continue;
      }

      // Remove fields not in schema
      delete result.audioUrl;

      await Word.create(result);
      console.log(`${progress} ✅ ${result.word} [${result.category}]`);
      inserted++;
    } catch (err) {
      if (err.code === 11000) {
        console.log(`${progress} ⏭️  ${meta.word} — already exists`);
      } else {
        console.log(`${progress} ❌ ${meta.word}: ${err.message}`);
        failed++;
      }
    }

    // Rate limit: 300ms between API calls
    if (i < wordItems.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  const total = await Word.countDocuments();
  console.log(`\n📚 Done: +${inserted} new, ${failed} failed. Total: ${total} words\n`);

  return { inserted, failed };
}

module.exports = { populateWords, fetchNextBatch };
