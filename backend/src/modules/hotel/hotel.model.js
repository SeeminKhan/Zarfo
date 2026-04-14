// src/modules/hotel/hotel.model.js
import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model for the hotel user
    required: true,
  },
  // Geo-coordinates of the hotel at listing time
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  photo: {
    type: String,
    default: "",   // empty for seeded/test data; UI handles missing photos gracefully
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['veg', 'non-veg', 'sweet', 'spicy', 'other'],
    required: true,
  },
  prepTime: {
    type: Date,
    required: true,
  },
  expiryTime: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number, // in kg or portions
    required: true,
  },
  sellingPrice: {
    type: Number,
    default: null, // Can be null for donations
  },
  aiSuggestedPrice: {
  type: Number,
  default: null
},
  status: {
    type: String,
    enum: ['listed_for_sale', 'listed_for_donation', 'sold', 'donated', 'wasted'],
    default: 'listed_for_sale',
  },
  decision: {
    type: String,
    enum: ['sell', 'donate'],
    default: 'sell', // AI's initial decision
  },
  isAvailable: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

// Compound index for the route optimizer query: active donations sorted by expiry
foodSchema.index({ isAvailable: 1, decision: 1, expiryTime: 1 });
foodSchema.index({ hotelId: 1, status: 1 });

export default mongoose.model('Food', foodSchema);