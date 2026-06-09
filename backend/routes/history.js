/**
 * GET /api/history?limit=20
 * Returns recent prediction history from MySQL.
 */
const express = require('express');
const router  = express.Router();
const { pool } = require('../db/connection');

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  try {
    const [rows] = await pool.execute(
      `SELECT id, city, locality, bhk, size_sqft, property_type,
              predicted_price, price_per_sqft, created_at
       FROM prediction_history
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );

    const history = rows.map(row => ({
      id:              row.id,
      city:            row.city,
      locality:        row.locality,
      bhk:             row.bhk,
      size_sqft:       row.size_sqft,
      property_type:   row.property_type,
      predicted_price: row.predicted_price,
      price_in_lakhs:  parseFloat((row.predicted_price / 100000).toFixed(2)),
      price_per_sqft:  parseFloat(row.price_per_sqft.toFixed(2)),
      created_at:      row.created_at,
    }));

    return res.json(history);
  } catch (err) {
    console.error('History route error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
