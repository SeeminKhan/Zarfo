import express from "express";
import { register, login, logout, refreshToken, updateLocation, getMe } from "./auth.controller.js";
import { protect } from "../../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.post("/logout",   logout);
router.post("/refresh",  refreshToken);
router.get("/me",        protect, getMe);
router.patch("/location", protect, updateLocation);   // ← set robin/user location

export default router;
