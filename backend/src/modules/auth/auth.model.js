import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["hotel", "user", "robin", "worker", "admin"],
      default: "user",
    },
    address: {
      houseNo: { type: String },
      suburb:  { type: String },
      city:    { type: String },
      state:   { type: String },
    },
    // Live / last-known coordinates — used by route optimizer for robins
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
