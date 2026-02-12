from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Zarfo FastAPI Engine", version="2.5")

# Load models
classifier = joblib.load("zarfo_classifier_pipeline.pkl")
regressor = joblib.load("zarfo_regressor_pipeline.pkl")
label_encoder = joblib.load("zarfo_label_encoder.pkl")

class FoodInput(BaseModel):
    FoodName: str
    Category: str
    PrepDate: str  # Format: YYYY-MM-DD
    PrepTime: str  # Format: HH:MM
    ExpiryDate: str # Format: YYYY-MM-DD
    ExpiryTime: str # Format: HH:MM
    Quantity: float
    Price: float   # This is the Original Price
    SimulatedTimeLeft: float = None # Optional for simulation

@app.post("/predict")
def predict_action(data: FoodInput):
    try:
        # Convert strings to datetime objects
        prep_dt = datetime.strptime(f"{data.PrepDate} {data.PrepTime}", "%Y-%m-%d %H:%M")
        exp_dt = datetime.strptime(f"{data.ExpiryDate} {data.ExpiryTime}", "%Y-%m-%d %H:%M")
        now = datetime.now()
        shelf_life = (exp_dt - prep_dt).total_seconds() / 3600
        
        # Use simulated time if provided, otherwise calculate real time left
        if data.SimulatedTimeLeft is not None:
            time_left = data.SimulatedTimeLeft
        else:
            time_left = (exp_dt - now).total_seconds() / 3600

        if time_left <= 0:
            return {"decision": "DONATE", "suggested_price": 0.0, "error": "Item Expired"}

        # Agent Logic: Donation Threshold
        DONATION_THRESHOLD = 4.5                # increase this value to see the decrease in the value of the food
        if time_left <= DONATION_THRESHOLD:
            return {"decision": "DONATE", "suggested_price": 0.0}

        # Dynamic Pricing Logic
        time_factor = (time_left - DONATION_THRESHOLD) / (shelf_life - DONATION_THRESHOLD) if shelf_life > DONATION_THRESHOLD else 0
        min_price = data.Price * 0.3
        suggested_price = min_price + (data.Price - min_price) * time_factor
        
        return {
            "decision": "SELL",
            "suggested_price": round(float(suggested_price), 2),
            "time_left": round(time_left, 2),
            "discount_percent": round(((data.Price - suggested_price) / data.Price) * 100, 1)
        }
    except Exception as e:
        return {"error": str(e)}