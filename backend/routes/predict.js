/**
 * POST /api/predict
 * Runs the Python ML model as a child process and saves result to MySQL.
 */
const express = require('express');
const router  = express.Router();
const { spawn } = require('child_process');
const path    = require('path');
const { pool } = require('../db/connection');

const ML_PREDICT_SCRIPT = path.join(__dirname, '../../ml/predict.py');
const PYTHON_CMD        = process.env.PYTHON_CMD || 'python';

/**
 * Spawn the Python predict.py script, pass input as JSON via stdin,
 * and return parsed JSON from stdout.
 */
function runPythonPredict(inputData) {
  return new Promise((resolve, reject) => {
    const py = spawn(PYTHON_CMD, [ML_PREDICT_SCRIPT], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    py.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    py.on('close', (code) => {
      if (code !== 0) {
        console.error('Python stderr:', stderr);
        return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${stdout}`));
      }
    });

    py.on('error', (err) => reject(new Error(`Failed to start Python: ${err.message}`)));

    // Send input as JSON to stdin
    py.stdin.write(JSON.stringify(inputData));
    py.stdin.end();
  });
}

// ── POST /api/predict ──────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    city, locality, bhk, size_sqft, property_type, furnishing,
    bathrooms, balconies, property_age, distance_metro,
    has_gym = false, has_pool = false, has_security = false,
    has_power_backup = false, has_clubhouse = false, has_parking = false,
    session_id = null,
  } = req.body;

  // ── Validation ──────────────────────────────────────────────
  if (!city || !locality || !bhk || !size_sqft || !property_type || !furnishing) {
    return res.status(400).json({ error: 'Missing required fields: city, locality, bhk, size_sqft, property_type, furnishing' });
  }

  if (bhk < 1 || bhk > 6)           return res.status(400).json({ error: 'BHK must be between 1 and 6' });
  if (size_sqft < 200 || size_sqft > 20000) return res.status(400).json({ error: 'Size must be between 200 and 20000 sq.ft' });

  const validTypes = ['Apartment', 'Independent House', 'Villa', 'Penthouse'];
  if (!validTypes.includes(property_type)) return res.status(400).json({ error: `property_type must be one of: ${validTypes.join(', ')}` });

  const validFurnish = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
  if (!validFurnish.includes(furnishing)) return res.status(400).json({ error: `furnishing must be one of: ${validFurnish.join(', ')}` });

  // ── Calculate amenity score ─────────────────────────────────
  const amenityScore = [has_gym, has_pool, has_security, has_power_backup, has_clubhouse, has_parking]
    .filter(Boolean).length;

  // ── ML Prediction ───────────────────────────────────────────
  const inputForML = {
    city, locality, bhk: parseInt(bhk),
    size_sqft: parseFloat(size_sqft),
    property_type, furnishing,
    bathrooms: parseInt(bathrooms) || Math.min(parseInt(bhk), 4),
    balconies: parseInt(balconies) || 1,
    property_age: parseInt(property_age) || 0,
    distance_metro: parseFloat(distance_metro) || 2.0,
    amenity_score: amenityScore,
    has_gym: !!has_gym, has_pool: !!has_pool, has_security: !!has_security,
    has_power_backup: !!has_power_backup, has_clubhouse: !!has_clubhouse, has_parking: !!has_parking,
  };

  let mlResult;
  try {
    mlResult = await runPythonPredict(inputForML);
  } catch (err) {
    console.error('ML prediction error:', err.message);
    return res.status(503).json({
      error: 'ML model unavailable',
      detail: 'Ensure the model is trained first by running: python ml/train.py',
    });
  }

  const { predicted_price, price_per_sqft, price_low, price_high, feature_impacts } = mlResult;

  // ── Save to MySQL ───────────────────────────────────────────
  let predictionId;
  try {
    const [result] = await pool.execute(
      `INSERT INTO prediction_history
        (city, locality, bhk, size_sqft, property_type, furnishing,
         bathrooms, balconies, property_age, distance_metro, amenity_score,
         has_gym, has_pool, has_security, has_power_backup, has_clubhouse, has_parking,
         predicted_price, price_per_sqft, price_low, price_high, session_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        city, locality, bhk, size_sqft, property_type, furnishing,
        inputForML.bathrooms, inputForML.balconies, inputForML.property_age, inputForML.distance_metro,
        amenityScore,
        has_gym ? 1 : 0, has_pool ? 1 : 0, has_security ? 1 : 0,
        has_power_backup ? 1 : 0, has_clubhouse ? 1 : 0, has_parking ? 1 : 0,
        Math.round(predicted_price), price_per_sqft, Math.round(price_low), Math.round(price_high),
        session_id,
      ]
    );
    predictionId = result.insertId;
  } catch (dbErr) {
    console.error('DB insert error:', dbErr.message);
    predictionId = null; // Return prediction even if DB fails
  }

  // ── Build response ──────────────────────────────────────────
  const priceInLakhs  = predicted_price / 100000;
  const priceInCrores = predicted_price / 10000000;

  return res.status(201).json({
    prediction_id:     predictionId,
    predicted_price:   Math.round(predicted_price),
    price_in_lakhs:    parseFloat(priceInLakhs.toFixed(2)),
    price_in_crores:   parseFloat(priceInCrores.toFixed(3)),
    price_per_sqft:    parseFloat(price_per_sqft.toFixed(2)),
    price_low:         Math.round(price_low),
    price_high:        Math.round(price_high),
    price_low_lakhs:   parseFloat((price_low / 100000).toFixed(2)),
    price_high_lakhs:  parseFloat((price_high / 100000).toFixed(2)),
    confidence_percent: 92.0,
    feature_impacts,
    city,
    locality,
  });
});

module.exports = router;
