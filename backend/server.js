/**
 * ══════════════════════════════════════════════════════════════════
 *  House Price Prediction — Express.js REST API Server
 *  Stack: Node.js + Express + MySQL + Python ML (child_process)
 * ══════════════════════════════════════════════════════════════════
 */
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
require('dotenv').config();

const { initDB, isUsingFallback } = require('./db/connection');

// ── Routes ──────────────────────────────────────────────────────
const citiesRouter    = require('./routes/cities');
const predictRouter   = require('./routes/predict');
const historyRouter   = require('./routes/history');
const feedbackRouter  = require('./routes/feedback');
const analyticsRouter = require('./routes/analytics');

const app  = express();
const PORT = process.env.PORT || 8000;

// ── Middleware ───────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logger (dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/cities',    citiesRouter);
app.use('/api/predict',   predictRouter);
app.use('/api/history',   historyRouter);
app.use('/api/feedback',  feedbackRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  const fallback = isUsingFallback();
  res.json({
    status:   'healthy',
    service:  'House Price Prediction REST API',
    version:  '2.0.0',
    stack:    'Node.js + Express + MySQL',
    database: fallback ? 'JSON fallback (set DB_PASSWORD in .env for MySQL)' : 'MySQL connected',
    time:     new Date().toISOString(),
  });
});


// ── Serve Frontend Static Files ──────────────────────────────────
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ── Global Error Handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────────
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log('\n══════════════════════════════════════════════');
      console.log(`  🏠 House Price Prediction API — ONLINE`);
      console.log(`  🌐 URL      : http://127.0.0.1:${PORT}`);
      console.log(`  📊 API Docs : http://127.0.0.1:${PORT}/api/health`);
      console.log(`  🗄️  Database : MySQL (${process.env.DB_NAME || 'house_price_db'})`);
      console.log('══════════════════════════════════════════════\n');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Ensure MySQL is running');
    console.error('  2. Check DB credentials in backend/.env');
    console.error('  3. Verify DB_NAME database exists\n');
    process.exit(1);
  }
}

startServer();
