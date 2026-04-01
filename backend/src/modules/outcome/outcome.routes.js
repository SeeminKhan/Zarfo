// Outcome logging routes
import express from 'express';
import * as outcomeController from './outcome.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

// Analytics
router.get('/analytics/:hotelId', protect, outcomeController.getAnalytics);

// Training data (admin only - add checkRole middleware if needed)
router.get('/training-data', protect, outcomeController.getTrainingData);

// Log outcomes
router.post('/sale/:foodId', protect, outcomeController.logSale);
router.post('/donation/:foodId', protect, outcomeController.logDonation);
router.post('/waste/:foodId', protect, outcomeController.logWaste);

export default router;
