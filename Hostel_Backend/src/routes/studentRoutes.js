import express from 'express';
import { createStudent, getStudents, getStudentById, updateStudent, patchStatus, loginStudent, deleteStudent } from '../controllers/studentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, verifyRole(['admin']), createStudent);
router.post('/login', loginStudent); // student login (public)
router.get('/get', verifyToken, verifyRole(['admin']), getStudents);
router.get('/get/:id', verifyToken, verifyRole(['admin','student']), getStudentById);
router.put('/update/:id', verifyToken, verifyRole(['admin']), updateStudent);
router.patch('/status/:id', verifyToken, verifyRole(['admin']), patchStatus);
router.delete('/delete/:id', verifyToken, verifyRole(['admin']), deleteStudent);

export default router;
