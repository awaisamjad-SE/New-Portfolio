import express from 'express';
import { addDailyMeal, getDailyMeals, getMealsByStudent } from '../controllers/dailyMealController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/add', verifyToken, verifyRole(['admin']), addDailyMeal);
router.get('/get', verifyToken, verifyRole(['admin']), getDailyMeals);
router.get('/get/:student_id', verifyToken, verifyRole(['admin','student']), getMealsByStudent);

export default router;
