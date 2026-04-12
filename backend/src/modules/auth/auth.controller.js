import { registerUser, loginUser } from "./auth.service.js";
import jwt from "jsonwebtoken";
import User from "./auth.model.js";
import { generateAccessToken } from "../../utils/token.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);

    // Store refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken, user }); 
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 */
export const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error("[auth/me] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/auth/location
 * Body: { lat: number, lng: number }
 * Updates the authenticated user's location — used by robins before route optimisation.
 */
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "lat and lng are required." });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: "lat and lng must be valid numbers." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { location: { lat: parsedLat, lng: parsedLng } },
      { new: true, select: "-password" }
    );

    console.log(`[auth/location] Updated location for user ${user._id} (${user.role}): lat=${parsedLat}, lng=${parsedLng}`);
    res.json({ message: "Location updated successfully", location: user.location });
  } catch (err) {
    console.error("[auth/location] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
