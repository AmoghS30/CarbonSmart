import re
import numpy as np

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Try to load model safely
try:
    import joblib
    model = joblib.load("model.pkl")
    print("✅ Loaded trained model successfully.")
except Exception as e:
    print(f"⚠️ Could not load model.pkl: {e}")
    print("Using dummy model instead.")
    model = None


def predict_emission(activity: str):
    """
    Predict carbon emissions based on activity description.
    Works even if model.pkl is missing or corrupted.
    """
    activity = str(activity).lower()
    number_match = re.search(r'\d+', activity)
    value = float(number_match.group()) if number_match else 1.0

    # Simple rule-based emission factors
    if "drive" in activity:
        factor = 0.2  # per km approximate
    elif "flight" in activity:
        factor = 0.5
    elif "train" in activity:
        factor = 0.1
    elif "walk" in activity or "cycle" in activity:
        factor = 0.01
    else:
        factor = 0.3

    base_emission = value * factor

    if model:
        try:
            prediction = model.predict(np.array([[base_emission]]))[0]
            return float(prediction)
        except Exception as e:
            print(f"⚠️ Model prediction error: {e}")
            return float(base_emission)
    else:
        return float(base_emission)


# ---------------- FastAPI App ---------------- #

app = FastAPI(title="CarbonSmart AI Prediction API")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "CarbonSmart AI Prediction API is running!"}


@app.get("/predict")
def predict(activity: str):
    emission = predict_emission(activity)
    return {
        "activity": activity,
        "predicted_emission": emission,
        "unit": "kg CO2e"
    }


@app.post("/predict")
def predict_post(data: dict):
    activity = data.get("activity", "")
    emission = predict_emission(activity)
    return {
        "activity": activity,
        "predicted_emission": emission,
        "unit": "kg CO2e"
    }
