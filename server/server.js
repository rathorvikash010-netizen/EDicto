require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

const connectDB = require('./src/config/db');
const env = require('./src/config/env');
const routes = require('./src/routes');
const { notFound } = require('./src/middleware/notFound');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// ──── Security ────
app.use(helmet());

// ──── Logging ────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ──── CORS ────
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// ──── Body Parsing ────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ──── Health Check ────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Edicto API is running', timestamp: new Date().toISOString() });
});

// ──── API Routes ────
app.use('/api', routes);

// ──── Error Handling ────
app.use(notFound);
app.use(errorHandler);

// ──── Start Server ────
const PORT = env.PORT;

connectDB().then(async () => {
  // ──── Migration: Drop old unique index on 'word' field if it exists ────
  try {
    const mongoose = require('mongoose');
    const collection = mongoose.connection.collection('dailywords');
    const indexes = await collection.indexes();
    const oldWordIndex = indexes.find(
      (idx) => idx.key && idx.key.word === 1 && !idx.key.fetchDay && idx.unique
    );
    if (oldWordIndex) {
      await collection.dropIndex(oldWordIndex.name);
      console.log('🔄 Dropped old unique index on "word" field (migrating to compound index)');
    }
  } catch (err) {
    // Collection might not exist yet — that's fine
    if (err.codeName !== 'NamespaceNotFound') {
      console.log('⚠️  Index migration note:', err.message);
    }
  }

  // Auto-populate daily words from Free Dictionary API (idempotent — skips if already fetched today)
  const { fetchAndStoreDailyWords } = require('./src/services/dailyWord.service');
  await fetchAndStoreDailyWords();

  // Also run the old populator for backwards compatibility with existing Word model
  const { populateWords } = require('./src/services/wordPopulator.service');
  await populateWords();

  // ──── Cron: Fetch new daily words at midnight every day ────
  cron.schedule('0 0 * * *', async () => {
    console.log('\n⏰ Midnight cron triggered: Fetching new daily words...');
    try {
      await fetchAndStoreDailyWords();
    } catch (err) {
      console.error('❌ Cron fetch failed:', err.message);
    }
  });
  console.log('⏰ Daily word cron job scheduled (runs at midnight)');

  app.listen(PORT, () => {
    console.log(`\n🚀 Edicto API running on port ${PORT} [${env.NODE_ENV}]`);
    console.log(`   https://edicto.onrender.com/api/health\n`);
  });
});
