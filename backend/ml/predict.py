import sys
import json
import joblib
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "stress_rf_firebase.pkl"

features = json.loads(sys.argv[1])

model = joblib.load(MODEL_PATH)

X = np.array(features, dtype=np.float32).reshape(1, -1)
proba = model.predict_proba(X)[0, 1]
label = "stressed" if proba >= 0.5 else "not_stressed"

print(json.dumps({
    "stress_label": label,
    "stress_index": round(float(proba) * 100, 1),
    "confidence": round(float(proba), 4)
}))