// Outcome logging model - tracks ML predictions vs real-world results
import mongoose from 'mongoose';

const outcomeSchema = new mongoose.Schema({
  // Reference to the food item
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  
  // ML Prediction Data
  prediction: {
    decision: {
      type: String,
      enum: ['sell', 'donate'],
      required: true,
    },
    suggestedPrice: {
      type: Number,
      default: null,
    },
    confidence: {
      type: Number, // 0-1 score if available
      default: null,
    },
    timeLeftAtPrediction: {
      type: Number, // hours
      required: true,
    },
    discountPercent: {
      type: Number,
      default: null,
    },
  },
  
  // Input Features (for retraining)
  features: {
    category: String,
    quantity: Number,
    originalPrice: Number,
    shelfLife: Number, // total hours from prep to expiry
    prepTime: Date,
    expiryTime: Date,
  },
  
  // Actual Outcome
  actualOutcome: {
    decision: {
      type: String,
      enum: ['sold', 'donated', 'wasted', 'pending'],
      default: 'pending',
    },
    finalPrice: {
      type: Number,
      default: null,
    },
    soldAt: {
      type: Date,
      default: null,
    },
    timeToSell: {
      type: Number, // hours from listing to sale
      default: null,
    },
    quantitySold: {
      type: Number,
      default: null,
    },
    quantityWasted: {
      type: Number,
      default: 0,
    },
  },
  
  // Performance Metrics
  metrics: {
    predictionAccurate: {
      type: Boolean,
      default: null, // true if prediction matched outcome
    },
    priceAcceptance: {
      type: Boolean,
      default: null, // true if sold at suggested price
    },
    wasteReduction: {
      type: Number, // percentage of food saved from waste
      default: null,
    },
    revenueGenerated: {
      type: Number,
      default: 0,
    },
  },
  
  // Context
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Metadata
  loggedAt: {
    type: Date,
    default: Date.now,
  },
  outcomeResolvedAt: {
    type: Date,
    default: null,
  },
  
}, { timestamps: true });

// Index for efficient querying
outcomeSchema.index({ foodId: 1 });
outcomeSchema.index({ hotelId: 1, createdAt: -1 });
outcomeSchema.index({ 'actualOutcome.decision': 1 });
outcomeSchema.index({ loggedAt: -1 });

export default mongoose.model('Outcome', outcomeSchema);
