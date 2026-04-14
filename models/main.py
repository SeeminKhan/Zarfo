from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(
    title="Zarfo AI Engine",
    version="2.5",
    description="AI-powered food waste management prediction service"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
try:
    classifier = joblib.load("zarfo_classifier_pipeline.pkl")
    regressor = joblib.load("zarfo_regressor_pipeline.pkl")
    label_encoder = joblib.load("zarfo_label_encoder.pkl")
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    classifier = None
    regressor = None
    label_encoder = None

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

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Zarfo AI Engine",
        "version": "2.5",
        "models_loaded": classifier is not None
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models": {
            "classifier": classifier is not None,
            "regressor": regressor is not None,
            "label_encoder": label_encoder is not None
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
def predict_action(data: FoodInput):
    """
    Predict whether to SELL or DONATE food based on time left and other factors.
    Returns suggested price if SELL, 0 if DONATE.
    """
    try:
        # Check if models are loaded
        if classifier is None or regressor is None:
            return {
                "error": "Models not loaded",
                "decision": "SELL",
                "suggested_price": data.Price * 0.7
            }

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
                "time_left": 0
            }
        
        # Agent Logic: Dynamic Donation Threshold
        # Cycles through values: 3.0, 4.5, 6.0, 7.5, 9.0 every minute
        review_thresholds = [3.0, 4.5, 6.0, 7.5, 9.0]
        DONATION_THRESHOLD = review_thresholds[datetime.now().minute % len(review_thresholds)]
        
        if time_left <= DONATION_THRESHOLD:
            return {
                "decision": "DONATE",
                "suggested_price": 0.0,
                "current_threshold": DONATION_THRESHOLD,
                "time_left": round(time_left, 2)
            }
        
        # Dynamic Pricing Logic
        time_factor = (time_left - DONATION_THRESHOLD) / (shelf_life - DONATION_THRESHOLD) if shelf_life > DONATION_THRESHOLD else 0
        min_price = data.Price * 0.3
        suggested_price = min_price + (data.Price - min_price) * time_factor
        
        return {
            "decision": "SELL",
            "suggested_price": round(float(suggested_price), 2),
            "time_left": round(time_left, 2),
            "discount_percent": round(((data.Price - suggested_price) / data.Price) * 100, 1),
            "current_threshold": DONATION_THRESHOLD
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "decision": "SELL",
            "suggested_price": data.Price * 0.7
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
