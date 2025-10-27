import express from 'express';
import { generatePayment, generatePaymentsForAll, getPayments, getPaymentsByStudent, updatePayment } from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/generate', verifyToken, verifyRole(['admin']), generatePayment);
router.post('/generate/all', verifyToken, verifyRole(['admin']), generatePaymentsForAll);
router.get('/get', verifyToken, verifyRole(['admin']), getPayments);
router.get('/get/:student_id', verifyToken, verifyRole(['admin','student']), getPaymentsByStudent);
router.put('/update/:id', verifyToken, verifyRole(['admin']), updatePayment);

export default router;
