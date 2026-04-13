/**
 * seed.js — Zarfo demo data seeder
 *
 * Creates 4 demo accounts + realistic food listings + orders + worker requests
 * so every portal has something to show immediately.
 *
 * Run once:  node seed.js
 */

import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import dotenv   from "dotenv";

dotenv.config();

// ── Models ─────────────────────────────────────────────────────────────────
import User               from "./src/modules/auth/auth.model.js";
import Food               from "./src/modules/hotel/hotel.model.js";
import Order              from "./src/modules/order/order.model.js";
import NightWorkerRequest from "./src/modules/nightworker/worker.model.js";

// ── Demo accounts ──────────────────────────────────────────────────────────
// All share the same Mumbai coords so the route optimizer matches them.
const COORDS = { lat: 19.076, lng: 72.877 };

const ACCOUNTS = [
  {
    name:     "The Grand Hotel",
    email:    "demo.hotel@zarfo.com",
    password: "demo1234",
    role:     "hotel",
    address:  { houseNo: "12", suburb: "Bandra", city: "Mumbai", state: "Maharashtra" },
    location: COORDS,
  },
  {
    name:     "Robin Sharma",
    email:    "demo.robin@zarfo.com",
    password: "demo1234",
    role:     "robin",
    address:  { houseNo: "5", suburb: "Andheri", city: "Mumbai", state: "Maharashtra" },
    location: COORDS,
  },
  {
    name:     "Priya Mehta",
    email:    "demo.user@zarfo.com",
    password: "demo1234",
    role:     "user",
    address:  { houseNo: "22", suburb: "Malad", city: "Mumbai", state: "Maharashtra" },
    location: { lat: 19.08, lng: 72.88 },
  },
  {
    name:     "Ravi Kumar",
    email:    "demo.worker@zarfo.com",
    password: "demo1234",
    role:     "worker",
    address:  { houseNo: "7", suburb: "Dharavi", city: "Mumbai", state: "Maharashtra" },
    location: { lat: 19.08, lng: 72.88 },
  },
];

// ── Food listings ──────────────────────────────────────────────────────────
const now = new Date();
const mins = (m) => new Date(now.getTime() + m * 60 * 1000);

const FOOD_TEMPLATES = [
  // Donation food (for worker + robin optimizer)
  {
    name: "Dal Makhani",       category: "veg",     quantity: 20, sellingPrice: 0,
    decision: "donate", status: "listed_for_donation", isAvailable: true,
    prepTime: mins(-120), expiryTime: mins(45),
    location: COORDS,
  },
  {
    name: "Chicken Biryani",   category: "non-veg", quantity: 15, sellingPrice: 0,
    decision: "donate", status: "listed_for_donation", isAvailable: true,
    prepTime: mins(-90),  expiryTime: mins(60),
    location: COORDS,
  },
  {
    name: "Veg Pulao",         category: "veg",     quantity: 25, sellingPrice: 0,
    decision: "donate", status: "listed_for_donation", isAvailable: true,
    prepTime: mins(-60),  expiryTime: mins(90),
    location: COORDS,
  },
  // Sale food (for user portal)
  {
    name: "Paneer Butter Masala", category: "veg",  quantity: 10, sellingPrice: 120,
    aiSuggestedPrice: 75,
    decision: "sell",   status: "listed_for_sale",     isAvailable: true,
    prepTime: mins(-30),  expiryTime: mins(120),
    location: COORDS,
  },
  {
    name: "Gulab Jamun",       category: "sweet",   quantity: 30, sellingPrice: 60,
    aiSuggestedPrice: 35,
    decision: "sell",   status: "listed_for_sale",     isAvailable: true,
    prepTime: mins(-45),  expiryTime: mins(150),
    location: COORDS,
  },
  {
    name: "Masala Dosa",       category: "veg",     quantity: 12, sellingPrice: 80,
    aiSuggestedPrice: 50,
    decision: "sell",   status: "listed_for_sale",     isAvailable: true,
    prepTime: mins(-20),  expiryTime: mins(100),
    location: COORDS,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
async function upsertUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    console.log(`  [skip] User already exists: ${data.email}`);
    return existing;
  }
  const hashed = await bcrypt.hash(data.password, 10);
  const user   = await User.create({ ...data, password: hashed });
  console.log(`  [created] ${user.role}: ${user.email}`);
  return user;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  // 1. Users
  console.log("── Creating demo users ──");
  const [hotel, robin, user, worker] = await Promise.all(ACCOUNTS.map(upsertUser));

  // 2. Food listings
  console.log("\n── Creating food listings ──");
  const foods = [];
  for (const tmpl of FOOD_TEMPLATES) {
    const existing = await Food.findOne({ hotelId: hotel._id, name: tmpl.name });
    if (existing) {
      console.log(`  [skip] Food already exists: ${tmpl.name}`);
      foods.push(existing);
      continue;
    }
    const food = await Food.create({ ...tmpl, hotelId: hotel._id, photo: "" });
    console.log(`  [created] ${food.status}: ${food.name} (expires in ${Math.round((food.expiryTime - now) / 60000)} min)`);
    foods.push(food);
  }

  const donationFoods = foods.filter((f) => f.status === "listed_for_donation");
  const saleFoods     = foods.filter((f) => f.status === "listed_for_sale");

  // 3. Worker requests donation food
  console.log("\n── Creating worker food requests ──");
  for (const food of donationFoods.slice(0, 2)) {
    const existing = await NightWorkerRequest.findOne({ workerId: worker._id, foodId: food._id });
    if (existing) { console.log(`  [skip] Request exists for: ${food.name}`); continue; }
    await NightWorkerRequest.create({
      workerId: worker._id,
      needFood: true,
      location: worker.location,
      foodId:   food._id,
      status:   "pending",
    });
    console.log(`  [created] Worker request for: ${food.name}`);
  }

  // 4. User places order for sale food
  console.log("\n── Creating user orders ──");
  const saleFood = saleFoods[0];
  if (saleFood) {
    const existingOrder = await Order.findOne({ userId: user._id, foodId: saleFood._id });
    if (existingOrder) {
      console.log(`  [skip] Order exists for: ${saleFood.name}`);
    } else {
      const price = saleFood.aiSuggestedPrice ?? saleFood.sellingPrice;
      const order = await Order.create({
        userId:      user._id,
        hotelId:     hotel._id,
        foodId:      saleFood._id,
        quantity:    1,
        price,
        totalAmount: price,
        status:      "pending_pickup",
      });
      // Mark food as sold
      await Food.updateOne({ _id: saleFood._id }, { $set: { isAvailable: false, status: "sold" } });

      // Create NightWorkerRequest so robin optimizer sees this user
      await NightWorkerRequest.create({
        workerId: user._id,
        needFood: true,
        location: user.location,
        foodId:   saleFood._id,
        status:   "pending",
      });
      console.log(`  [created] Order for ${saleFood.name} by ${user.name} (₹${price})`);
    }
  }

  console.log("\n── Demo seed complete ──");
  console.log("\nDemo credentials (password: demo1234):");
  console.log("  Hotel:  demo.hotel@zarfo.com");
  console.log("  Robin:  demo.robin@zarfo.com");
  console.log("  User:   demo.user@zarfo.com");
  console.log("  Worker: demo.worker@zarfo.com");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
