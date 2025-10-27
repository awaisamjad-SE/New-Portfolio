import express from 'express';
import { addDailyMeal, getDailyMeals, getMealsByStudent, updateDailyMeal, deleteDailyMeal, getMonthlyMealsSummary, getPopularFoods, sendMonthlyReportToAll, sendWeeklyReportToAll } from '../controllers/dailyMealController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/add', verifyToken, verifyRole(['admin']), addDailyMeal);
router.get('/get', verifyToken, verifyRole(['admin']), getDailyMeals);
router.get('/get/:student_id', verifyToken, verifyRole(['admin','student']), getMealsByStudent);
router.put('/update/:id', verifyToken, verifyRole(['admin']), updateDailyMeal);
router.delete('/delete/:id', verifyToken, verifyRole(['admin']), deleteDailyMeal);
router.get('/summary/:month', verifyToken, verifyRole(['admin']), getMonthlyMealsSummary);
router.get('/popular/:month', verifyToken, verifyRole(['admin']), getPopularFoods);
// main_admin endpoints to send reports to all students
router.post('/send/monthly', verifyToken, verifyRole(['main_admin']), sendMonthlyReportToAll);
router.post('/send/weekly', verifyToken, verifyRole(['main_admin']), sendWeeklyReportToAll);

export default router;
