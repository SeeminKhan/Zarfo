# Zarfo AI Engine - Render Deployment Guide

## 📦 What This Service Does

The Zarfo AI Engine is a FastAPI service that provides ML-powered predictions for food waste management:
- Decides whether to SELL or DONATE food based on time left
- Provides dynamic pricing suggestions
- Uses trained ML models for intelligent decision-making

## 🚀 Deploy to Render

### Step 1: Prepare Your Repository

1. **Commit all files to Git:**
```bash
cd models
git add .
git commit -m "Add FastAPI ML service for deployment"
git push origin seemin
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up or log in with GitHub
3. Connect your GitHub account

### Step 3: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (Zarfo)
3. Configure the service:

**Basic Settings:**
- **Name:** `zarfo-ai-engine` (or any name you prefer)
- **Region:** Choose closest to your users
- **Branch:** `seemin`
- **Root Directory:** `models`
- **Runtime:** `Python 3`

**Build & Deploy Settings:**
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- **Free** (for testing)
- **Starter** ($7/month - recommended for production)

### Step 4: Environment Variables (Optional)

If you need any environment variables, add them in the "Environment" section:
- `PYTHON_VERSION=3.11.7`

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Render will:
   - Install dependencies
   - Load your ML models
   - Start the FastAPI server

### Step 6: Get Your API URL

Once deployed, you'll get a URL like:
```
https://zarfo-ai-engine.onrender.com
```

### Step 7: Test Your Deployment

Test the health endpoint:
```bash
curl https://zarfo-ai-engine.onrender.com/health
```

Test the prediction endpoint:
```bash
curl -X POST https://zarfo-ai-engine.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "FoodName": "Pizza",
    "Category": "Italian",
    "PrepDate": "2025-01-15",
    "PrepTime": "10:00",
    "ExpiryDate": "2025-01-15",
    "ExpiryTime": "22:00",
    "Quantity": 5,
    "Price": 299
  }'
```

### Step 8: Update Backend .env

Update your backend `.env` file with the new URL:
```env
FASTAPI_URL=https://zarfo-ai-engine.onrender.com/predict
```

## 📊 API Endpoints

### GET /
Health check endpoint
```json
{
  "status": "healthy",
  "service": "Zarfo AI Engine",
  "version": "2.5",
  "models_loaded": true
}
```

### GET /health
Detailed health check
```json
{
  "status": "healthy",
  "models": {
    "classifier": true,
    "regressor": true,
    "label_encoder": true
  },
  "timestamp": "2025-01-15T10:30:00"
}
```

### POST /predict
Make predictions
```json
{
  "FoodName": "Pizza",
  "Category": "Italian",
  "PrepDate": "2025-01-15",
  "PrepTime": "10:00",
  "ExpiryDate": "2025-01-15",
  "ExpiryTime": "22:00",
  "Quantity": 5,
  "Price": 299
}
```

Response:
```json
{
  "decision": "SELL",
  "suggested_price": 209.3,
  "time_left": 8.5,
  "discount_percent": 30.0,
  "current_threshold": 3.0
}
```

## 🔧 Troubleshooting

### Models Not Loading
- Ensure `.pkl` files are committed to Git
- Check file sizes (Render has limits)
- Verify file paths in `main.py`

### Deployment Fails
- Check build logs in Render dashboard
- Verify `requirements.txt` has correct versions
- Ensure Python version is compatible

### API Not Responding
- Check service logs in Render
- Verify the service is running
- Test health endpoint first

## 💰 Pricing

**Free Tier:**
- 750 hours/month
- Spins down after 15 min of inactivity
- Cold starts (30-60 seconds)

**Starter Tier ($7/month):**
- Always on
- No cold starts
- Better performance

## 🔄 Auto-Deploy

Render automatically deploys when you push to the connected branch:
```bash
git add .
git commit -m "Update ML models"
git push origin seemin
```

## 📝 Notes

- ML model files (`.pkl`) must be in the `models` folder
- Keep model files under 100MB for faster deployments
- Use environment variables for sensitive data
- Monitor usage in Render dashboard

## 🎉 Success!

Once deployed, your Zarfo backend can call:
```
https://zarfo-ai-engine.onrender.com/predict
```

And get real-time AI predictions for food waste management!
