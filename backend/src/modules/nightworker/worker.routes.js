import express from 'express';
import { protect } from '../../middlewares/auth.js';
import { checkRole } from '../../middlewares/checkRole.js';
import {
  browseDonationFood,
  createDonationOrder,
  fetchMyReceivedMeals
} from './worker.controller.js';

const router = express.Router();

// Worker feed (FREE DONATION FOOD)
router.get('/browse', protect, checkRole('worker'), browseDonationFood);

// Worker places “donation order”
router.post('/order/create', protect, checkRole('worker'), createDonationOrder);

// Worker order history
router.get('/orders', protect, checkRole('worker'), fetchMyReceivedMeals);

export default router;
