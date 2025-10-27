import express from 'express';
import { generatePayment, generatePaymentsForAll, getPayments, getPaymentsByStudent, updatePayment, getMonthlyReport, getStudentPaymentsTrend, getPaymentsSummary, markPaymentPaid, getTopExpenses } from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Payment management — restrict admin-level actions to main_admin only
router.post('/generate', verifyToken, verifyRole(['main_admin']), generatePayment);
router.post('/generate/all', verifyToken, verifyRole(['main_admin']), generatePaymentsForAll);
router.get('/get', verifyToken, verifyRole(['main_admin']), getPayments);
// Students can still fetch their own payments; admins may fetch any student's payments
router.get('/get/:student_id', verifyToken, verifyRole(['admin','student']), getPaymentsByStudent);
router.get('/report/:student_id/:month', verifyToken, verifyRole(['main_admin']), getMonthlyReport);
router.get('/trend/:student_id', verifyToken, verifyRole(['admin','student']), getStudentPaymentsTrend);
router.get('/summary', verifyToken, verifyRole(['main_admin']), getPaymentsSummary);
router.patch('/pay/:id', verifyToken, verifyRole(['main_admin']), markPaymentPaid);
router.get('/top/:month', verifyToken, verifyRole(['main_admin']), getTopExpenses);
router.put('/update/:id', verifyToken, verifyRole(['main_admin']), updatePayment);

export default router;
