import mongoose from "mongoose";

const workerRequestSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    needFood: { type: Boolean, default: false },
    location: {
      lat: Number,
      lng: Number,
    },
    assignedFood: { type: mongoose.Schema.Types.ObjectId, ref: "Food", default: null },
    assignedRobin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["pending", "assigned", "delivered", "expired"],
      default: "pending",
    },
    feedback: {
      rating: Number, // 1-5
      comment: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("NightWorkerRequest", workerRequestSchema);
