import { optimizeRoute } from "./index.js";
import { DEMAND_RADIUS_KM } from "./scorer.js";

/**
 * Diagnostic Test Script for Route Optimization
 * 
 * Run with: npm run test:optimizer
 * 
 * This script tests the priority scoring logic by simulating different
 * scenarios (urgency vs demand vs distance).
 */

async function runDiagnostic() {
  console.log("====================================================");
  console.log("ZARFO ROUTE OPTIMIZER DIAGNOSTIC");
  console.log("====================================================\n");

  // 1. Setup Mock Robin (Delivery Partner)
  const robin = {
    _id: "robin_001",
    name: "John Doe",
    location: { lat: 12.9716, lng: 77.5946 } // Bangalore Central
  };

  // 2. Setup Mock Hotels (Food Listings)
  const now = Date.now();
  const hotels = [
    {
      _id: "hotel_urgent",
      name: "Urgent Palace",
      location: { lat: 12.9800, lng: 77.6000 },
      expiryTime: new Date(now + 15 * 60 * 1000).toISOString(), // 15 mins left (Urgency: Critical)
      quantity: 10,
      category: "Veg",
      decision: "DONATE"
    },
    {
      _id: "hotel_high_demand",
      name: "High Demand Hub",
      location: { lat: 12.9500, lng: 77.5800 },
      expiryTime: new Date(now + 120 * 60 * 1000).toISOString(), // 2 hours left (Urgency: Low)
      quantity: 50,
      category: "Non-Veg",
      decision: "DONATE"
    },
    {
      _id: "hotel_far_away",
      name: "Far Away Food",
      location: { lat: 13.0500, lng: 77.7000 }, // ~15km away
      expiryTime: new Date(now + 60 * 60 * 1000).toISOString(), // 1 hour left (Urgency: High)
      quantity: 20,
      category: "Snack",
      decision: "DONATE"
    }
  ];

  // 3. Setup Mock Workers (Requests)
  const workerRequests = [
    // Urgent Palace has 1 request
    { _id: "req_1", foodId: "hotel_urgent", location: { lat: 12.9810, lng: 77.6010 } },
    
    // High Demand Hub has 5 requests (High Demand Bonus)
    { _id: "req_2", foodId: "hotel_high_demand", location: { lat: 12.9510, lng: 77.5810 } },
    { _id: "req_3", foodId: "hotel_high_demand", location: { lat: 12.9520, lng: 77.5820 } },
    { _id: "req_4", foodId: "hotel_high_demand", location: { lat: 12.9530, lng: 77.5830 } },
    { _id: "req_5", foodId: "hotel_high_demand", location: { lat: 12.9540, lng: 77.5840 } },
    { _id: "req_6", foodId: "hotel_high_demand", location: { lat: 12.9550, lng: 77.5850 } },
    
    // Far Away Food has 2 requests
    { _id: "req_7", foodId: "hotel_far_away", location: { lat: 13.0510, lng: 77.7010 } },
    { _id: "req_8", foodId: "hotel_far_away", location: { lat: 13.0520, lng: 77.7020 } }
  ];

  const workersByFood = {
    "hotel_urgent": [workerRequests[0]],
    "hotel_high_demand": workerRequests.slice(1, 6),
    "hotel_far_away": workerRequests.slice(6, 8)
  };

  try {
    console.log("Running optimizer with:");
    console.log(` - Robin Location: ${robin.location.lat}, ${robin.location.lng}`);
    console.log(` - Preferred Radius: ${DEMAND_RADIUS_KM}km\n`);

    const routes = await optimizeRoute(robin, hotels, workerRequests, workersByFood);

    console.log("----------------------------------------------------");
    console.log("RANK | HOTEL NAME       | SCORE  | RISK     | DIST  ");
    console.log("----------------------------------------------------");

    routes.forEach((route, index) => {
        const rank = (index + 1).toString().padEnd(4);
        const name = route.hotelName.padEnd(16);
        const score = route.priorityScore.toFixed(4).padEnd(6);
        const risk = route.expiryRisk.padEnd(8);
        const dist = (route.totalDistance.toFixed(2) + "km").padEnd(6);
        
        console.log(`${rank} | ${name} | ${score} | ${risk} | ${dist}`);
    });

    console.log("----------------------------------------------------");
    console.log("\nDETAILED SCORE BREAKDOWN:");
    routes.forEach(route => {
        console.log(`\n Hotel: ${route.hotelName}`);
        console.log(` - Expiry Score:   ${route.scores.expiryScore}`);
        console.log(` - Proximity (H):  ${route.scores.robinToHotelScore} (Robin to Hotel)`);
        console.log(` - Proximity (W):  ${route.scores.robinToWorkerScore} (Avg Robin to Worker)`);
        console.log(` - Demand Score:   ${route.scores.demandScore}`);
        console.log(` - Quantity Score: ${route.scores.quantityScore}`);
    });

  } catch (error) {
    console.error("Diagnostic Failed:", error);
  }
}

runDiagnostic();
