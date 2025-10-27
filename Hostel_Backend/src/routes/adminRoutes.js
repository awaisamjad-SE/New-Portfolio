import express from 'express';
import { createAdmin, loginAdmin, getAdmins, updateAdmin, deleteAdmin } from '../controllers/adminController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Only a 'main_admin' may create other admins
router.post('/create', verifyToken, verifyRole(['main_admin']), createAdmin);
router.post('/login', loginAdmin); // login should be public

router.get('/get', verifyToken, verifyRole(['admin']), getAdmins);
// Only main_admin can update or delete admin accounts
router.put('/update/:id', verifyToken, verifyRole(['main_admin']), updateAdmin);
router.delete('/delete/:id', verifyToken, verifyRole(['main_admin']), deleteAdmin);

export default router;
