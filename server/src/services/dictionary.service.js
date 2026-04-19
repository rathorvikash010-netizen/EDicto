/**
 * Dictionary API Service
 * Fetches real word data from the Free Dictionary API and formats it
 * for our Word model.
 *
 * API: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 */

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Fetch and parse a word from the Free Dictionary API.
 * @param {string} word - The word to look up
 * @param {Object} meta - Additional metadata { category, difficulty }
 * @returns {Object|null} Parsed word data ready for the Word model
 */
async function fetchWord(word, meta = {}) {
  const url = `${API_BASE}/${encodeURIComponent(word.toLowerCase())}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return { error: `Word "${word}" not found in dictionary` };
    }
    return { error: `Dictionary API returned status ${response.status}` };
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return { error: `No data returned for "${word}"` };
  }

  return parseAPIResponse(data[0], word, meta);
}

/**
 * Parse the Free Dictionary API response into our Word schema format.
 */
function parseAPIResponse(apiData, originalWord, meta) {
  const { phonetic, phonetics, meanings } = apiData;

  // ── Pronunciation ──
  let pronunciation = phonetic || '';
  if (!pronunciation && phonetics && phonetics.length > 0) {
    const withText = phonetics.find((p) => p.text);
    if (withText) pronunciation = withText.text;
  }

  // ── Audio URL (bonus field) ──
  let audioUrl = '';
  if (phonetics && phonetics.length > 0) {
    const withAudio = phonetics.find((p) => p.audio && p.audio.length > 0);
    if (withAudio) audioUrl = withAudio.audio;
  }

  // ── Best meaning (prefer the one with most definitions) ──
  if (!meanings || meanings.length === 0) {
    return { error: `No meanings found for "${originalWord}"` };
  }

  const bestMeaning = meanings.reduce((best, current) => {
    if (!best) return current;
    return current.definitions.length > best.definitions.length ? current : best;
  }, null);

  if (!bestMeaning || bestMeaning.definitions.length === 0) {
    return { error: `No definitions found for "${originalWord}"` };
  }

  const partOfSpeech = bestMeaning.partOfSpeech || 'unknown';
  const primaryDef = bestMeaning.definitions[0];
  const meaning = primaryDef.definition || '';

  // ── Example sentence ──
  let example = '';
  // Try primary definition first
  if (primaryDef.example) {
    example = primaryDef.example;
  }
  // Try other definitions in best meaning
  if (!example) {
    for (const def of bestMeaning.definitions) {
      if (def.example) { example = def.example; break; }
    }
  }
  // Try other meanings
  if (!example) {
    for (const m of meanings) {
      for (const def of m.definitions) {
        if (def.example) { example = def.example; break; }
      }
      if (example) break;
    }
  }
  if (!example) {
    example = `The word "${originalWord}" is commonly used in academic and professional contexts.`;
  }

  // ── Synonyms (deduplicated, max 6) ──
  const synonymSet = new Set();
  for (const m of meanings) {
    if (m.synonyms) m.synonyms.forEach((s) => synonymSet.add(s));
    for (const def of m.definitions) {
      if (def.synonyms) def.synonyms.forEach((s) => synonymSet.add(s));
    }
  }
  const synonyms = Array.from(synonymSet).slice(0, 6);

  // ── Capitalize word ──
  const capitalizedWord = originalWord.charAt(0).toUpperCase() + originalWord.slice(1).toLowerCase();

  return {
    word: capitalizedWord,
    pronunciation: pronunciation || `/${originalWord}/`,
    partOfSpeech,
    meaning,
    example,
    category: meta.category || 'GRE',
    difficulty: meta.difficulty || 3,
    synonyms,
    audioUrl,
  };
}

module.exports = { fetchWord };
