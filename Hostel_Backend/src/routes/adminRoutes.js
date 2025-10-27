import express from 'express';
import { createAdmin, loginAdmin, getAdmins, updateAdmin, deleteAdmin } from '../controllers/adminController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, verifyRole(['admin']), createAdmin);
router.post('/login', loginAdmin); // login should be public

router.get('/get', verifyToken, verifyRole(['admin']), getAdmins);
router.put('/update/:id', verifyToken, verifyRole(['admin']), updateAdmin);
router.delete('/delete/:id', verifyToken, verifyRole(['admin']), deleteAdmin);

export default router;
