import {
  addFoodListing,
  getHotelListings,
  getFoodListingById,
  getAIDecision,
} from "./hotel.service.js";

// Helper function to format Date object components for Python's strict parser
// We use local time methods to avoid UTC shifts that could change the date 
const formatDateComponent = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format Time component for Python's strict parser
const formatTimeComponent = (dateObj) => {
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const addFood = async (req, res, next) => {
  try {
    const hotelId = req.user.id;

    const prep = new Date(req.body.prepTime);
    const expiry = new Date(req.body.expiryTime);

    // Use the original price for the AI model input
    const actualPrice = Number(req.body.sellingPrice || 0);

    // here we are checking all the keys are matching with the fastapi model keys (i.e. FoodInput model in fastapi)
    const aiInput = {
      FoodName: req.body.name,
      Category: req.body.category,
      PrepDate: formatDateComponent(prep),
      PrepTime: formatTimeComponent(prep),
      ExpiryDate: formatDateComponent(expiry),
      ExpiryTime: formatTimeComponent(expiry),
      Quantity: Number(req.body.quantity),
      Price: actualPrice,
    };

    // Call FastAPI to get prediction
    console.log("Calling AI for prediction with input:", aiInput);
    const aiPrediction = await getAIDecision(aiInput);
    console.log("AI Prediction received:", aiPrediction);

    // Preparing listing data to be saved in DB
    const decision = aiPrediction.decision?.toLowerCase() || "sell";
    const listingData = {
      ...req.body,
      decision,
      sellingPrice: actualPrice,
      aiSuggestedPrice: aiPrediction.suggested_price ?? null,
      quantity: Number(req.body.quantity),
      prepTime: prep,
      expiryTime: expiry,
      photo: req.file ? req.file.buffer : "",
    };

    const food = await addFoodListing(listingData, hotelId);
    console.log(`Food added successfully! ID: ${food._id}, Status: ${food.status}, Decision: ${food.decision}`);
    res.status(201).json({ message: "Food listed successfully", food });
  } catch (err) {
    next(err);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const hotelId = req.user.id;
    const listings = await getHotelListings(hotelId);
    res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
};

export const getFoodDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await getFoodListingById(id);
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
};
