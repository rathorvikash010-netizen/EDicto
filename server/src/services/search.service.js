/**
 * Search Service
 * 
 * Fetches word data live from the Free Dictionary API for on-demand search.
 * Does NOT store results — only saves to DB when user explicitly bookmarks/saves.
 */

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const SUGGEST_API = 'https://api.datamuse.com/sug';

/**
 * Get autocomplete suggestions for a partial word.
 * Uses the Datamuse suggestion API — fast and doesn't require the word to exist in our DB.
 * Returns up to 5 suggestions.
 */
async function suggestWords(prefix) {
  if (!prefix || prefix.trim().length < 2) {
    return [];
  }

  try {
    const url = `${SUGGEST_API}?s=${encodeURIComponent(prefix.trim())}&max=5`;
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Datamuse returns [{ word: "...", score: N }, ...]
    return data.map((item) => item.word).slice(0, 5);
  } catch (err) {
    console.error('Suggestion fetch failed:', err.message);
    return [];
  }
}

/**
 * Search for a word from the Free Dictionary API.
 * Returns full parsed word data with synonyms, antonyms, etc.
 */
async function searchWord(term) {
  if (!term || term.trim().length === 0) {
    return { error: 'Search term is required' };
  }

  const cleanTerm = term.trim().toLowerCase();
  const url = `${API_BASE}/${encodeURIComponent(cleanTerm)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return { error: `Word "${term}" not found in dictionary` };
      }
      return { error: `Dictionary API returned status ${response.status}` };
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { error: `No data returned for "${term}"` };
    }

    return parseSearchResult(data[0], cleanTerm);
  } catch (err) {
    return { error: `Failed to search: ${err.message}` };
  }
}

/**
 * Parse Free Dictionary API response for search results.
 * Returns richer data than the daily word parser (includes antonyms, multiple meanings).
 */
function parseSearchResult(apiData, originalWord) {
  const { phonetic, phonetics, meanings } = apiData;

  // ── Pronunciation ──
  let pronunciation = phonetic || '';
  if (!pronunciation && phonetics && phonetics.length > 0) {
    const withText = phonetics.find((p) => p.text);
    if (withText) pronunciation = withText.text;
  }

  // ── Audio URL ──
  let audioUrl = '';
  if (phonetics && phonetics.length > 0) {
    const withAudio = phonetics.find((p) => p.audio && p.audio.length > 0);
    if (withAudio) audioUrl = withAudio.audio;
  }

  // ── All meanings ──
  if (!meanings || meanings.length === 0) {
    return { error: `No meanings found for "${originalWord}"` };
  }

  // Pick the best meaning (most definitions)
  const bestMeaning = meanings.reduce((best, current) => {
    if (!best) return current;
    return current.definitions.length > best.definitions.length ? current : best;
  }, null);

  if (!bestMeaning || bestMeaning.definitions.length === 0) {
    return { error: `No definitions found for "${originalWord}"` };
  }

  const partOfSpeech = bestMeaning.partOfSpeech || 'unknown';
  const primaryDef = bestMeaning.definitions[0];
  const definition = primaryDef.definition || '';

  // ── Example sentence ──
  let example = '';
  if (primaryDef.example) {
    example = primaryDef.example;
  }
  if (!example) {
    for (const def of bestMeaning.definitions) {
      if (def.example) { example = def.example; break; }
    }
  }
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

  // ── Synonyms (deduplicated, max 8) ──
  const synonymSet = new Set();
  for (const m of meanings) {
    if (m.synonyms) m.synonyms.forEach((s) => synonymSet.add(s));
    for (const def of m.definitions) {
      if (def.synonyms) def.synonyms.forEach((s) => synonymSet.add(s));
    }
  }
  const synonyms = Array.from(synonymSet).slice(0, 8);

  // ── Antonyms (deduplicated, max 8) ──
  const antonymSet = new Set();
  for (const m of meanings) {
    if (m.antonyms) m.antonyms.forEach((a) => antonymSet.add(a));
    for (const def of m.definitions) {
      if (def.antonyms) def.antonyms.forEach((a) => antonymSet.add(a));
    }
  }
  const antonyms = Array.from(antonymSet).slice(0, 8);

  // ── Capitalize word ──
  const capitalizedWord = originalWord.charAt(0).toUpperCase() + originalWord.slice(1).toLowerCase();

  return {
    word: capitalizedWord,
    pronunciation: pronunciation || `/${originalWord}/`,
    partOfSpeech,
    definition,
    example,
    synonyms,
    antonyms,
    audioUrl,
  };
}

module.exports = { searchWord, suggestWords };

