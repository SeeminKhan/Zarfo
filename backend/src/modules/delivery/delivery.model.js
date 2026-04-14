import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    // The robin assigned to this delivery
    robinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // The hotel being picked up from
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The food item being delivered
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    // All recipients (workers/users) on this route
    recipientIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // NightWorkerRequest IDs being served
    workerRequestIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NightWorkerRequest",
      },
    ],

    // Order IDs being fulfilled
    orderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    // Snapshot of the route from the optimizer
    routeSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      enum: ["assigned", "picked_up", "delivered", "cancelled"],
      default: "assigned",
    },

    pickedUpAt:  { type: Date, default: null },
    deliveredAt: { type: Date, default: null },

    // Photo proof uploaded by robin
    pickupProof:   { type: String, default: null },  // base64 or URL
    deliveryProof: { type: String, default: null },
  },
  { timestamps: true }
);

deliverySchema.index({ robinId: 1, status: 1 });
deliverySchema.index({ hotelId: 1, status: 1 });
deliverySchema.index({ foodId: 1 });

export default mongoose.model("Delivery", deliverySchema);
