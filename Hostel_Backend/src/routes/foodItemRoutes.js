import express from 'express';
import { createFoodItem, getFoodItems, updateFoodItem, deleteFoodItem } from '../controllers/foodItemController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, verifyRole(['admin']), createFoodItem);
router.get('/get', verifyToken, verifyRole(['admin']), getFoodItems);
router.put('/update/:id', verifyToken, verifyRole(['admin']), updateFoodItem);
router.delete('/delete/:id', verifyToken, verifyRole(['admin']), deleteFoodItem);

export default router;
