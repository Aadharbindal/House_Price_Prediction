/**
 * POST /api/feedback
 * Saves user accuracy rating for a prediction.
 */
const express = require('express');
const router  = express.Router();
const { pool } = require('../db/connection');

router.post('/', async (req, res) => {
  const { prediction_id, rating, comment = null, actual_price = null } = req.body;

  if (!prediction_id || !rating) {
    return res.status(400).json({ error: 'prediction_id and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO feedback (prediction_id, rating, comment, actual_price)
       VALUES (?, ?, ?, ?)`,
      [prediction_id, rating, comment, actual_price ? Math.round(actual_price) : null]
    );

    return res.status(201).json({
      message:     'Feedback submitted successfully',
      feedback_id: result.insertId,
    });
  } catch (err) {
    console.error('Feedback route error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
