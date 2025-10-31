import express from 'express';
import { getNotificationLogs, getNotificationLogById } from '../controllers/notificationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// GET /notifications/logs?status=sent&limit=20&page=1
router.get('/logs', verifyToken, verifyRole(['admin','main_admin']), getNotificationLogs);
router.get('/logs/:id', verifyToken, verifyRole(['admin','main_admin']), getNotificationLogById);

export default router;
