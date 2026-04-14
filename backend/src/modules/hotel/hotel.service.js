// src/modules/hotel/hotel.service.js
import Food from "./hotel.model.js";
import { logPrediction } from "../outcome/outcome.service.js";

export const addFoodListing = async (listingData, hotelId) => {
  if (listingData.quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  // Convert uploaded image buffer to Base64
  let photoBase64 = "";
  if (listingData.photo && listingData.photo.length) {
    photoBase64 = listingData.photo.toString("base64");
  }

  const newListing = {
    ...listingData,
    hotelId,
    photo: photoBase64,
    status:
      listingData.decision === "donate"
        ? "listed_for_donation"
        : "listed_for_sale",
  };

  const food = await Food.create(newListing);
  
  // Log the initial ML prediction for outcome tracking
  try {
    const shelfLife = (new Date(listingData.expiryTime) - new Date(listingData.prepTime)) / (1000 * 60 * 60);
    const timeLeft = (new Date(listingData.expiryTime) - new Date()) / (1000 * 60 * 60);
    
    await logPrediction(
      food._id,
      {
        decision: listingData.decision || 'sell',
        suggested_price: listingData.aiSuggestedPrice || listingData.sellingPrice,
        time_left: timeLeft,
        discount_percent: listingData.sellingPrice 
          ? ((listingData.sellingPrice - (listingData.aiSuggestedPrice || listingData.sellingPrice)) / listingData.sellingPrice * 100)
          : 0,
      },
      {
        category: listingData.category,
        quantity: listingData.quantity,
        originalPrice: listingData.sellingPrice,
        shelfLife,
        timeLeft,
        prepTime: listingData.prepTime,
        expiryTime: listingData.expiryTime,
      },
      hotelId
    );
  } catch (error) {
    console.error('Failed to log prediction:', error);
    // Don't fail the listing if logging fails
  }
  
  return food;
};

export const getHotelListings = async (hotelId) => {
  const listings = await Food.find({ hotelId }).sort({ createdAt: -1 });
  return listings;
};

export const getFoodListingById = async (listingId) => {
  const listing = await Food.findById(listingId);
  if (!listing) throw new Error("Food listing not found.");
  return listing;
};

// Function to call FastAPI endpoint for AI decision
export const getAIDecision = async (foodData) => {
  const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000/predict";

  try {
    const payload = {
      FoodName: foodData.FoodName,
      Category: foodData.Category,
      PrepDate: foodData.PrepDate,
      PrepTime: foodData.PrepTime,
      ExpiryDate: foodData.ExpiryDate,
      ExpiryTime: foodData.ExpiryTime,
      Quantity: foodData.Quantity,
      Price: foodData.Price,
    };

    const res = await fetch(FASTAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI service responded with ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("AI Prediction Error:", err.message);
    throw new Error("AI service failed to respond");
  }
};
