/**
 * UTC-safe date utilities using YYYY-MM-DD strings.
 * 
 * Uses IST offset (UTC+5:30) for "today/yesterday" calculations
 * so streak dates align with the user's actual day boundary.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30

/**
 * Get the current date in IST as YYYY-MM-DD.
 */
function getTodayString() {
  const now = new Date(Date.now() + IST_OFFSET_MS);
  return now.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in IST as YYYY-MM-DD.
 */
function getYesterdayString() {
  const now = new Date(Date.now() + IST_OFFSET_MS);
  now.setUTCDate(now.getUTCDate() - 1);
  return now.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the start of the current week (Sunday 00:00 IST, expressed as UTC).
 */
function getWeekStartUTC() {
  const now = new Date(Date.now() + IST_OFFSET_MS);
  const day = now.getUTCDay(); // 0 = Sunday
  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() - day);
  start.setUTCHours(0, 0, 0, 0);
  // Convert back from IST to true UTC
  return new Date(start.getTime() - IST_OFFSET_MS);
}

module.exports = {
  getTodayString,
  getYesterdayString,
  addDays,
  getDayOfYear,
  getWeekStartUTC,
};
