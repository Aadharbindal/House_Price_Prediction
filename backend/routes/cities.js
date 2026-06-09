/**
 * GET /api/cities
 * Returns all cities with their localities, pricing, and market data.
 */
const express = require('express');
const router = express.Router();
const CITY_CONFIG = require('../config/cityConfig');

router.get('/', (req, res) => {
  try {
    const cities = Object.entries(CITY_CONFIG).map(([cityName, cfg]) => {
      const localities = Object.entries(cfg.localities)
        .map(([name, { mult, tier }]) => ({
          name,
          avg_price_sqft: Math.round(cfg.base_psf * mult),
          price_tier: tier,
        }))
        .sort((a, b) => b.avg_price_sqft - a.avg_price_sqft);

      return {
        city: cityName,
        localities,
        base_price_sqft: cfg.base_psf,
        market_trend: cfg.market_trend,
      };
    });

    // Sort cities by base price descending
    cities.sort((a, b) => b.base_price_sqft - a.base_price_sqft);

    return res.json(cities);
  } catch (err) {
    console.error('Cities route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
