import express from "express";
import { register, login, logout, refreshToken, updateLocation, getMe, geocodeAllUsers, geocodeMyAddress } from "./auth.controller.js";
import { protect } from "../../middlewares/auth.js";

const router = express.Router();

router.post("/register",        register);
router.post("/login",           login);
router.post("/logout",          logout);
router.post("/refresh",         refreshToken);
router.get( "/me",              protect, getMe);
router.patch("/location",       protect, updateLocation);
router.post("/geocode-address", protect, geocodeMyAddress);  // re-geocode own address
router.post("/geocode-all",     protect, geocodeAllUsers);   // one-time backfill

export default router;
