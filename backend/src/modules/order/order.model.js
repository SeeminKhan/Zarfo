// src/modules/order/order.model.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // from food.hotelId
    },

    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true, // sellingPrice at order time
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending_pickup', 'on_the_way', 'delivered', 'cancelled'],
      default: 'pending_pickup',
    },

    pickupTime: Date,
    deliveryTime: Date,

    deliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
