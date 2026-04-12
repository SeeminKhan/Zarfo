import mongoose from "mongoose";

const workerRequestSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    needFood: { type: Boolean, default: false },
    location: {
      lat: Number,
      lng: Number,
    },
    // The specific food item this worker requested — links request to a food listing
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: null,
    },
    assignedFood:  { type: mongoose.Schema.Types.ObjectId, ref: "Food", default: null },
    assignedRobin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["pending", "assigned", "delivered", "expired"],
      default: "pending",
    },
    feedback: {
      rating:  Number,
      comment: String,
    },
  },
  { timestamps: true }
);

workerRequestSchema.index({ status: 1 });
workerRequestSchema.index({ foodId: 1, status: 1 });
workerRequestSchema.index({ "location.lat": 1, "location.lng": 1 });

export default mongoose.model("NightWorkerRequest", workerRequestSchema);
