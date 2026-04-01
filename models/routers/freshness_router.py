# Freshness scoring router - vision-based food quality assessment
import io
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image, UnidentifiedImageError
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import os

router = APIRouter()
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "freshness_model.pth"

# Image preprocessing (ImageNet normalization)
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

# Metadata blending weights
PREP_HOUR_PENALTY = 0.015   # each hour since prep reduces score
MAX_PREP_PENALTY = 0.35     # cap so metadata can't dominate
CATEGORY_BIAS = {
    "salad": -0.08,    # wilts quickly
    "seafood": -0.10,  # highest spoilage risk
    "dessert": +0.05,  # generally more stable
    "rice": +0.02,
    "bread": -0.03,
    "biryani": 0.0,
    "curry": -0.02,
    "veg": +0.01,
    "non-veg": -0.05,
}

# Model factory
def build_model():
    m = models.mobilenet_v2(weights=None)
    m.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(m.last_channel, 128),
        nn.ReLU(),
        nn.Linear(128, 1),
    )
    return m

def load_model():
    m = build_model().to(DEVICE)
    if os.path.exists(MODEL_PATH):
        m.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        print(f"✅ Loaded trained freshness weights from {MODEL_PATH}")
    else:
        # Zero-shot fallback using pretrained ImageNet weights
        print("⚠️  No trained weights found — using zero-shot fallback")
        base = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        m.features.load_state_dict(base.features.state_dict())
    m.eval()
    return m

# Load model once at startup
model = load_model()

# Response schema
class FreshnessResponse(BaseModel):
    freshness_score: float        # 0.0 (stale) → 1.0 (fresh)
    label: str                    # "fresh" | "borderline" | "stale"
    confidence: float             # how certain the model is
    vision_score: float           # raw vision output before metadata blend
    metadata_adjustment: float    # how much metadata shifted the score
    recommendation: str           # human-readable advice

def score_to_label(score: float) -> str:
    if score >= 0.70:
        return "fresh"
    if score >= 0.40:
        return "borderline"
    return "stale"

def build_recommendation(label: str, score: float) -> str:
    if label == "fresh":
        return "Good visual quality — proceed with normal SELL/DONATE classification."
    if label == "borderline":
        return f"Marginal freshness ({score:.2f}) — bias classifier toward DONATE or apply deeper discount."
    return f"Poor visual quality ({score:.2f}) — recommend immediate DONATE regardless of time remaining."

# Endpoint
@router.post("/shelf_life", response_model=FreshnessResponse)
async def score_freshness(
    photo: UploadFile = File(..., description="Food photo (JPEG/PNG)"),
    prep_hours: float = Form(0.0, description="Hours since food was prepared"),
    food_category: str = Form("", description="Category e.g. 'salad', 'rice', 'seafood'"),
):
    # 1. Read and validate image
    raw = await photo.read()
    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # 2. Run through MobileNetV2
    tensor = TRANSFORM(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        logit = model(tensor)
        vision_score = float(torch.sigmoid(logit).squeeze())

    # 3. Blend metadata signal
    prep_penalty = min(prep_hours * PREP_HOUR_PENALTY, MAX_PREP_PENALTY)
    cat_bias = CATEGORY_BIAS.get(food_category.lower().strip(), 0.0)
    adjustment = -prep_penalty + cat_bias
    blended = float(min(max(vision_score + adjustment, 0.0), 1.0))

    # 4. Confidence: distance from 0.5 decision boundary
    confidence = round(abs(blended - 0.5) * 2, 3)

    label = score_to_label(blended)
    return FreshnessResponse(
        freshness_score=round(blended, 3),
        label=label,
        confidence=confidence,
        vision_score=round(vision_score, 3),
        metadata_adjustment=round(adjustment, 3),
        recommendation=build_recommendation(label, blended),
    )
