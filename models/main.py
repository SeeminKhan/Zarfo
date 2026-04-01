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

def generate_explanation(decision, time_left, shelf_life, discount_percent, suggested_price, original_price, donation_threshold):
    """
    Generate human-readable explanation for ML decision
    """
    explanations = []
    
    # Time-based reasoning
    if time_left <= donation_threshold:
        explanations.append(f"Only {time_left:.1f} hours left (below {donation_threshold}h threshold)")
        explanations.append("Recommending donation to prevent waste")
    else:
        time_percent = (time_left / shelf_life) * 100 if shelf_life > 0 else 0
        explanations.append(f"{time_left:.1f}h remaining ({time_percent:.0f}% of shelf life)")
    
    # Pricing reasoning
    if decision == "SELL":
        if discount_percent > 50:
            explanations.append(f"Deep discount ({discount_percent:.0f}%) to attract buyers quickly")
        elif discount_percent > 25:
            explanations.append(f"Moderate discount ({discount_percent:.0f}%) balances revenue & urgency")
        else:
            explanations.append(f"Light discount ({discount_percent:.0f}%) - still fresh")
        
        explanations.append(f"Price: ₹{original_price} → ₹{suggested_price} (saves ₹{original_price - suggested_price:.0f})")
    
    # Urgency indicator
    if time_left <= donation_threshold * 2 and decision == "SELL":
        explanations.append("Entering critical window - monitor closely")
    
    return " | ".join(explanations)

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
            return {
                "decision": "DONATE",
                "suggested_price": 0.0,
                "error": "Item Expired",
                "explanation": "Item has expired - immediate donation required to prevent waste"
            }

        # Agent Logic: Donation Threshold
        DONATION_THRESHOLD = 4.5
        if time_left <= DONATION_THRESHOLD:
            explanation = generate_explanation("DONATE", time_left, shelf_life, 0, 0, data.Price, DONATION_THRESHOLD)
            return {
                "decision": "DONATE",
                "suggested_price": 0.0,
                "explanation": explanation,
                "reasoning": {
                    "time_left": round(time_left, 2),
                    "threshold": DONATION_THRESHOLD,
                    "shelf_life": round(shelf_life, 2),
                }
            }

        # Dynamic Pricing Logic
        time_factor = (time_left - DONATION_THRESHOLD) / (shelf_life - DONATION_THRESHOLD) if shelf_life > DONATION_THRESHOLD else 0
        min_price = data.Price * 0.3
        suggested_price = min_price + (data.Price - min_price) * time_factor
        discount_percent = ((data.Price - suggested_price) / data.Price) * 100
        
        explanation = generate_explanation("SELL", time_left, shelf_life, discount_percent, suggested_price, data.Price, DONATION_THRESHOLD)
        
        return {
            "decision": "SELL",
            "suggested_price": round(float(suggested_price), 2),
            "time_left": round(time_left, 2),
            "discount_percent": round(discount_percent, 1),
            "explanation": explanation,
            "reasoning": {
                "time_factor": round(time_factor, 3),
                "min_price": round(min_price, 2),
                "shelf_life": round(shelf_life, 2),
                "donation_threshold": DONATION_THRESHOLD,
            }
        }
    except Exception as e:
        return {"error": str(e)}