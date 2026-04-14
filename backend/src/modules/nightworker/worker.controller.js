import {
  getDonationFood,
  placeDonationOrder,
  getWorkerOrders
} from './worker.service.js';

export const browseDonationFood = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await getDonationFood(filters);
    res.status(200).json(result);
    console.log("Donation food fetched with filters:", filters);
  } catch (err) {
    next(err);
  }
};

export const createDonationOrder = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const { foodId } = req.body;

    const order = await placeDonationOrder(workerId, foodId);

    res.status(201).json({
      message: "Food reserved successfully",
      order
    });
  } catch (err) {
    next(err);
  }
};

export const fetchMyReceivedMeals = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const orders = await getWorkerOrders(workerId);

    res.status(200).json(orders);
    console.log(`Fetched ${orders.length} orders for worker ${workerId}`);
  } catch (err) {
    next(err);
  }
};
