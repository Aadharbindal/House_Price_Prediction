"""
ML Training Pipeline - House Price Prediction
Trains a Gradient Boosting Regressor. Saves model + metadata JSON.
Called once during setup. Node.js never calls this directly.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import json, joblib

import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

ML_DIR   = Path(__file__).resolve().parent
DATA_DIR = ML_DIR / "data"
MODEL_PATH    = ML_DIR / "model.joblib"
METADATA_PATH = ML_DIR / "model_metadata.json"

FEATURE_COLS = [
    "city", "locality", "bhk", "size_sqft", "property_type", "furnishing",
    "bathrooms", "balconies", "property_age", "distance_metro", "amenity_score",
    "has_gym", "has_pool", "has_security", "has_power_backup", "has_clubhouse", "has_parking",
]
CAT_COLS  = ["city", "locality", "property_type", "furnishing"]
NUM_COLS  = ["bhk", "size_sqft", "bathrooms", "balconies", "property_age", "distance_metro", "amenity_score"]
BOOL_COLS = ["has_gym", "has_pool", "has_security", "has_power_backup", "has_clubhouse", "has_parking"]


def train():
    # ── Data ───────────────────────────────────────────────────
    csv = DATA_DIR / "dataset.csv"
    if not csv.exists():
        print("Generating dataset first...")
        sys.path.insert(0, str(ML_DIR))
        from dataset_gen import generate_dataset
        DATA_DIR.mkdir(exist_ok=True)
        df = generate_dataset(15000)
        df.to_csv(csv, index=False)
    else:
        df = pd.read_csv(csv)

    print(f"Dataset: {len(df)} records")

    X = df[FEATURE_COLS]
    y = df["price"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    # ── Pipeline ───────────────────────────────────────────────
    preprocessor = ColumnTransformer([
        ("cat",  OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT_COLS),
        ("num",  StandardScaler(), NUM_COLS),
        ("bool", "passthrough", BOOL_COLS),
    ])

    model = GradientBoostingRegressor(
        n_estimators=500, learning_rate=0.08, max_depth=6,
        min_samples_split=10, min_samples_leaf=5, subsample=0.85,
        max_features="sqrt", random_state=42,
        validation_fraction=0.1, n_iter_no_change=30, verbose=1,
    )

    pipeline = Pipeline([("preprocessor", preprocessor), ("regressor", model)])

    print("\n[ML] Training Gradient Boosting Regressor...")
    pipeline.fit(X_train, y_train)

    # ── Evaluation ─────────────────────────────────────────────
    y_pred = pipeline.predict(X_test)
    r2   = r2_score(y_test, y_pred)
    mae  = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))

    print(f"\n{'='*40}")
    print(f"  R2 Score : {r2:.4f}")
    print(f"  MAE      : Rs.{mae:,.0f}")
    print(f"  RMSE     : Rs.{rmse:,.0f}")
    print(f"{'='*40}")

    # ── Feature importances ────────────────────────────────────
    cat_names = (
        pipeline.named_steps["preprocessor"]
        .named_transformers_["cat"]
        .get_feature_names_out(CAT_COLS)
        .tolist()
    )
    all_names = cat_names + NUM_COLS + BOOL_COLS
    imps = dict(zip(all_names, pipeline.named_steps["regressor"].feature_importances_.tolist()))

    group_imp = {
        "Location (City & Locality)": sum(v for k, v in imps.items() if "city" in k or "locality" in k),
        "Size & BHK":                 sum(v for k, v in imps.items() if "size_sqft" in k or "bhk" in k),
        "Property Type":              sum(v for k, v in imps.items() if "property_type" in k),
        "Furnishing":                 sum(v for k, v in imps.items() if "furnishing" in k),
        "Amenities":                  sum(v for k, v in imps.items() if "has_" in k or "amenity_score" in k),
        "Age & Connectivity":         sum(v for k, v in imps.items() if "property_age" in k or "distance_metro" in k),
    }
    total = sum(group_imp.values())
    group_imp = {k: round(v / total * 100, 2) for k, v in group_imp.items()}

    # ── Save artifacts ─────────────────────────────────────────
    joblib.dump(pipeline, MODEL_PATH)

    metadata = {
        "r2_score": round(r2, 4), "mae": round(mae, 0), "rmse": round(rmse, 0),
        "group_importance": group_imp, "feature_cols": FEATURE_COLS,
        "n_train": len(X_train), "n_test": len(X_test),
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2))

    print(f"\n[OK] Model saved -> {MODEL_PATH}")
    print(f"[OK] Metadata  -> {METADATA_PATH}")
    print("\nGroup Importances:")
    for k, v in group_imp.items():
        print(f"  {k}: {v}%")


if __name__ == "__main__":
    train()
