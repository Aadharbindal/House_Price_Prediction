"""
ML Inference Script - called by Node.js as a child process.
Reads a JSON object from stdin, outputs a JSON result to stdout.
Node.js route: spawn('python', ['ml/predict.py']) -> write JSON to stdin -> read JSON from stdout
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stdin.reconfigure(encoding='utf-8')
import json

import joblib
import numpy as np
import pandas as pd
from pathlib import Path

ML_DIR     = Path(__file__).resolve().parent
MODEL_PATH = ML_DIR / "model.joblib"
META_PATH  = ML_DIR / "model_metadata.json"

FEATURE_COLS = [
    "city", "locality", "bhk", "size_sqft", "property_type", "furnishing",
    "bathrooms", "balconies", "property_age", "distance_metro", "amenity_score",
    "has_gym", "has_pool", "has_security", "has_power_backup", "has_clubhouse", "has_parking",
]
BOOL_COLS = ["has_gym", "has_pool", "has_security", "has_power_backup", "has_clubhouse", "has_parking"]

def load_artifacts():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. "
            "Run: python ml/train.py"
        )
    pipeline = joblib.load(MODEL_PATH)
    metadata = json.loads(META_PATH.read_text())
    return pipeline, metadata


def main():
    # Read JSON from stdin (sent by Node.js)
    raw = sys.stdin.read().strip()
    if not raw:
        print(json.dumps({"error": "No input received"}))
        sys.exit(1)

    try:
        inp = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {e}"}))
        sys.exit(1)

    try:
        pipeline, metadata = load_artifacts()
    except FileNotFoundError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    # Build input DataFrame
    row = {col: inp.get(col) for col in FEATURE_COLS}
    df  = pd.DataFrame([row])

    for col in BOOL_COLS:
        df[col] = df[col].astype(bool)

    predicted_price = float(pipeline.predict(df)[0])
    predicted_price = max(100000, predicted_price)

    size_sqft    = float(inp.get("size_sqft", 1000))
    price_per_sqft = predicted_price / size_sqft
    price_low    = predicted_price * 0.92   # ±8% confidence
    price_high   = predicted_price * 1.08

    # Feature impact from model metadata
    group_imp = metadata.get("group_importance", {})
    feature_impacts = []
    for name, pct in sorted(group_imp.items(), key=lambda x: -x[1]):
        if "Location" in name:
            direction = "positive"
        elif "Age" in name:
            direction = "negative" if int(inp.get("property_age", 0)) > 10 else "positive"
        elif "Amenities" in name:
            direction = "positive" if int(inp.get("amenity_score", 0)) > 2 else "neutral"
        else:
            direction = "positive"
        feature_impacts.append({
            "feature": name,
            "impact_percent": round(pct, 2),
            "direction": direction,
        })

    result = {
        "predicted_price":  round(predicted_price, 2),
        "price_per_sqft":   round(price_per_sqft, 2),
        "price_low":        round(price_low, 2),
        "price_high":       round(price_high, 2),
        "feature_impacts":  feature_impacts,
    }

    # Output JSON to stdout — Node.js reads this
    print(json.dumps(result))


if __name__ == "__main__":
    main()
