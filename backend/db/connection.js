/**
 * MySQL Connection Pool using mysql2.
 * Falls back to an in-memory/JSON store if MySQL is unavailable,
 * so the app can still run for demos without a DB connection.
 */
const mysql  = require('mysql2/promise');
const path   = require('path');
const fs     = require('fs');
require('dotenv').config();

// ── In-memory fallback store ──────────────────────────────────
const FALLBACK_FILE = path.join(__dirname, '../../data/fallback_store.json');
let fallbackData = { predictions: [], feedback: [] };
let usingFallback = false;

function loadFallback() {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(FALLBACK_FILE)) {
      fallbackData = JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf-8'));
    }
  } catch { /* start fresh */ }
}

function saveFallback() {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(fallbackData, null, 2));
  } catch { /* ignore write errors */ }
}

loadFallback();

// ── MySQL Pool ────────────────────────────────────────────────
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'house_price_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

/**
 * Wrapper: tries MySQL, falls back to JSON file store on failure.
 */
const db = {
  usingFallback: false,

  async execute(sql, params = []) {
    if (usingFallback) return db._fallbackExecute(sql, params);
    try {
      return await pool.execute(sql, params);
    } catch (err) {
      if (!usingFallback) {
        console.warn('[DB] MySQL query failed, using fallback store:', err.message);
      }
      return db._fallbackExecute(sql, params);
    }
  },

  _fallbackExecute(sql, params) {
    const s = sql.trim().toUpperCase();

    // INSERT prediction_history
    if (s.startsWith('INSERT INTO PREDICTION_HISTORY')) {
      const id = (fallbackData.predictions.length > 0
        ? Math.max(...fallbackData.predictions.map(r => r.id)) + 1 : 1);
      const row = {
        id,
        city: params[0], locality: params[1], bhk: params[2], size_sqft: params[3],
        property_type: params[4], furnishing: params[5],
        bathrooms: params[6], balconies: params[7], property_age: params[8],
        distance_metro: params[9], amenity_score: params[10],
        has_gym: params[11], has_pool: params[12], has_security: params[13],
        has_power_backup: params[14], has_clubhouse: params[15], has_parking: params[16],
        predicted_price: params[17], price_per_sqft: params[18],
        price_low: params[19], price_high: params[20], session_id: params[21],
        created_at: new Date().toISOString(),
      };
      fallbackData.predictions.push(row);
      saveFallback();
      return [{ insertId: id }];
    }

    // INSERT feedback
    if (s.startsWith('INSERT INTO FEEDBACK')) {
      const id = (fallbackData.feedback.length > 0
        ? Math.max(...fallbackData.feedback.map(r => r.id)) + 1 : 1);
      const row = { id, prediction_id: params[0], rating: params[1], comment: params[2], actual_price: params[3], created_at: new Date().toISOString() };
      fallbackData.feedback.push(row);
      saveFallback();
      return [{ insertId: id }];
    }

    // SELECT COUNT(*) total
    if (s.includes('COUNT(*)') && s.includes('PREDICTION_HISTORY')) {
      return [[{ total: fallbackData.predictions.length }]];
    }

    // SELECT history
    if (s.startsWith('SELECT') && s.includes('PREDICTION_HISTORY') && s.includes('ORDER BY')) {
      const limit = params[0] || 20;
      const rows = [...fallbackData.predictions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
      return [rows];
    }

    // GROUP BY city
    if (s.includes('AVG(PRICE_PER_SQFT)') && s.includes('GROUP BY CITY')) {
      const cityMap = {};
      fallbackData.predictions.forEach(r => {
        if (!cityMap[r.city]) cityMap[r.city] = [];
        cityMap[r.city].push(r.price_per_sqft);
      });
      const rows = Object.entries(cityMap).map(([city, vals]) => ({
        city, avg_psf: vals.reduce((a, b) => a + b, 0) / vals.length,
      }));
      return [rows];
    }

    // GROUP BY property_type
    if (s.includes('PROPERTY_TYPE') && s.includes('GROUP BY PROPERTY_TYPE')) {
      const map = {};
      fallbackData.predictions.forEach(r => { map[r.property_type] = (map[r.property_type] || 0) + 1; });
      return [Object.entries(map).map(([property_type, cnt]) => ({ property_type, cnt }))];
    }

    // GROUP BY bhk
    if (s.includes('BHK') && s.includes('GROUP BY BHK')) {
      const map = {};
      fallbackData.predictions.forEach(r => { map[r.bhk] = (map[r.bhk] || 0) + 1; });
      return [Object.entries(map).map(([bhk, cnt]) => ({ bhk, cnt }))];
    }

    return [[]];
  },
};

/**
 * Initialize DB tables. If MySQL auth fails, enable fallback mode.
 */
async function initDB() {
  try {
    const conn = await pool.getConnection();
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'house_price_db'}\``);
    await conn.query(`USE \`${process.env.DB_NAME || 'house_price_db'}\``);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS prediction_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(100) NOT NULL, locality VARCHAR(200) NOT NULL,
        bhk TINYINT UNSIGNED NOT NULL, size_sqft FLOAT NOT NULL,
        property_type VARCHAR(100) NOT NULL, furnishing VARCHAR(100) NOT NULL,
        bathrooms TINYINT UNSIGNED NOT NULL, balconies TINYINT UNSIGNED NOT NULL,
        property_age TINYINT UNSIGNED NOT NULL, distance_metro FLOAT NOT NULL,
        amenity_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
        has_gym TINYINT(1) DEFAULT 0, has_pool TINYINT(1) DEFAULT 0,
        has_security TINYINT(1) DEFAULT 0, has_power_backup TINYINT(1) DEFAULT 0,
        has_clubhouse TINYINT(1) DEFAULT 0, has_parking TINYINT(1) DEFAULT 0,
        predicted_price BIGINT NOT NULL, price_per_sqft FLOAT NOT NULL,
        price_low BIGINT NOT NULL, price_high BIGINT NOT NULL,
        session_id VARCHAR(64) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_city (city), INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prediction_id INT NOT NULL, rating TINYINT UNSIGNED NOT NULL,
        comment TEXT DEFAULT NULL, actual_price BIGINT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prediction_id (prediction_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    conn.release();
    console.log('[DB] MySQL connected and tables ready.');
    usingFallback = false;
    db.usingFallback = false;

  } catch (err) {
    usingFallback = true;
    db.usingFallback = true;
    console.warn('[DB] MySQL unavailable — using local JSON fallback store.');
    console.warn('[DB] To use MySQL: set DB_PASSWORD in backend/.env and restart.');
    console.warn('[DB] Error:', err.message);
  }
}

module.exports = { pool: db, initDB, isUsingFallback: () => usingFallback };
