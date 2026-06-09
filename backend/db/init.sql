-- ══════════════════════════════════════════════════
--  House Price Prediction — MySQL Schema
--  Run: mysql -u root -p < db/init.sql
-- ══════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS house_price_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE house_price_db;

-- ── Prediction History ─────────────────────────────
CREATE TABLE IF NOT EXISTS prediction_history (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  city            VARCHAR(100) NOT NULL,
  locality        VARCHAR(200) NOT NULL,
  bhk             TINYINT UNSIGNED NOT NULL,
  size_sqft       FLOAT NOT NULL,
  property_type   VARCHAR(100) NOT NULL,
  furnishing      VARCHAR(100) NOT NULL,
  bathrooms       TINYINT UNSIGNED NOT NULL,
  balconies       TINYINT UNSIGNED NOT NULL,
  property_age    TINYINT UNSIGNED NOT NULL,
  distance_metro  FLOAT NOT NULL,
  amenity_score   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  has_gym         TINYINT(1) NOT NULL DEFAULT 0,
  has_pool        TINYINT(1) NOT NULL DEFAULT 0,
  has_security    TINYINT(1) NOT NULL DEFAULT 0,
  has_power_backup TINYINT(1) NOT NULL DEFAULT 0,
  has_clubhouse   TINYINT(1) NOT NULL DEFAULT 0,
  has_parking     TINYINT(1) NOT NULL DEFAULT 0,
  predicted_price BIGINT NOT NULL,
  price_per_sqft  FLOAT NOT NULL,
  price_low       BIGINT NOT NULL,
  price_high      BIGINT NOT NULL,
  session_id      VARCHAR(64) DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_city (city),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── User Feedback ──────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  prediction_id   INT NOT NULL,
  rating          TINYINT UNSIGNED NOT NULL,
  comment         TEXT DEFAULT NULL,
  actual_price    BIGINT DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prediction_id (prediction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Verify ─────────────────────────────────────────
SELECT 'Database initialized successfully!' AS status;
