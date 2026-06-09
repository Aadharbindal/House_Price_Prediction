/**
 * GET /api/analytics
 * Returns aggregated stats from MySQL + model metadata from JSON file.
 */
const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const { pool } = require('../db/connection');
const CITY_CONFIG = require('../config/cityConfig');

const METADATA_PATH = path.join(__dirname, '../../ml/model_metadata.json');

function loadModelMetadata() {
  try {
    if (fs.existsSync(METADATA_PATH)) {
      return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
    }
  } catch { /* file may not exist yet */ }
  return null;
}

router.get('/', async (req, res) => {
  try {
    // ── Aggregate from MySQL ──────────────────────────────────
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM prediction_history'
    );

    const [cityRows] = await pool.execute(
      `SELECT city, AVG(price_per_sqft) AS avg_psf
       FROM prediction_history GROUP BY city`
    );

    const [propRows] = await pool.execute(
      `SELECT property_type, COUNT(*) AS cnt
       FROM prediction_history GROUP BY property_type`
    );

    const [bhkRows] = await pool.execute(
      `SELECT bhk, COUNT(*) AS cnt
       FROM prediction_history GROUP BY bhk`
    );

    // ── Baseline prices (always available from config) ─────────
    const baselineCityPrices = {};
    Object.entries(CITY_CONFIG).forEach(([city, cfg]) => {
      baselineCityPrices[city] = cfg.base_psf;
    });

    // ── Model metadata ─────────────────────────────────────────
    const meta = loadModelMetadata();

    return res.json({
      total_predictions:         total,
      city_avg_price_sqft:       Object.fromEntries(cityRows.map(r => [r.city, parseFloat(r.avg_psf.toFixed(2))])),
      property_type_distribution:Object.fromEntries(propRows.map(r => [r.property_type, r.cnt])),
      bhk_distribution:          Object.fromEntries(bhkRows.map(r => [String(r.bhk), r.cnt])),
      baseline_city_prices:      baselineCityPrices,
      model_info: meta ? {
        r2_score:         meta.r2_score,
        mae:              meta.mae,
        n_train:          meta.n_train,
        group_importance: meta.group_importance,
      } : null,
    });
  } catch (err) {
    console.error('Analytics route error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
