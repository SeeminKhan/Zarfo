import bcrypt from "bcryptjs";
import User from "./auth.model.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import { geocodeAddress } from "../../utils/geocode.js";

export const registerUser = async ({ name, email, password, role, address }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  // Geocode the address to get lat/lng for the route optimizer
  const location = await geocodeAddress(address);
  if (location) {
    console.log(`[auth.service] Geocoded location for ${email}: lat=${location.lat}, lng=${location.lng}`);
  } else {
    console.warn(`[auth.service] Could not geocode address for ${email} — location will be null.`);
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    address,
    location: location ?? { lat: null, lng: null },
  });

  return user;
};



export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};
