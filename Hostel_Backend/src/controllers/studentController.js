import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from 'joi';
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import { sendMail } from '../utils/mail.js';
import { welcomeTemplate, loginSuccessTemplate } from '../utils/emailTemplates.js';
import { getClientIp, fetchIpInfo } from '../utils/ipinfo.js';
import { notify } from '../utils/notifier.js';

const createSchema = Joi.object({
  student_id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  department: Joi.string().optional(),
  session: Joi.string().optional(),
  room_number: Joi.string().optional(),
  contact: Joi.string().optional(),
});

export const createStudent = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);

    const existing = await Student.findOne({ email: value.email });
    if (existing) return errorResponse(res, 'Student with this email already exists', 400);

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(value.password, salt);
    const student = new Student({ ...value, password: hashed, added_by: req.user ? req.user.id : null });
    await student.save();

    // Send welcome email to student (non-blocking) and log it
    try {
      await notify({ to: student.email, subject: 'Welcome to Hostel Portal', html: welcomeTemplate({ name: student.name, id: student.student_id, role: 'student' }), meta: { type: 'welcome', studentId: student.student_id } });
    } catch (e) {
      console.error('Failed to send welcome email to student', e);
    }

    return successResponse(res, 'Student created', { id: student._id }, 201);
  } catch (err) {
    next(err);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().select('-password');
    return successResponse(res, 'Students list', students);
  } catch (err) {
    next(err);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const id = req.params.id;
    // Determine whether the param is a Mongo ObjectId (24 hex chars)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    // Ensure token is present
    if (!req.user) return errorResponse(res, 'Unauthorized - token required', 401);

    // If student role, ensure they are requesting their own record. Compare against both
    // the Mongo _id (req.user.id) and the custom student_id (req.user.student_id).
    if (req.user && req.user.role === 'student') {
      const isOwnByObjectId = req.user.id && isObjectId && String(req.user.id) === String(id);
      const isOwnByStudentId = req.user.student_id && String(req.user.student_id) === String(id);
      if (!isOwnByObjectId && !isOwnByStudentId) {
        return errorResponse(res, 'Access denied', 403);
      }
    }

    // Fetch by ObjectId when appropriate, otherwise look up by student_id
    let student;
    if (isObjectId) {
      student = await Student.findById(id).select('-password');
    } else {
      student = await Student.findOne({ student_id: id }).select('-password');
    }

    if (!student) return errorResponse(res, 'Student not found', 404);
    return successResponse(res, 'Student record', student);
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = req.body;
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }
    const student = await Student.findByIdAndUpdate(id, update, { new: true }).select('-password');
    return successResponse(res, 'Student updated', student);
  } catch (err) {
    next(err);
  }
};

export const patchStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { active } = req.body;
    const student = await Student.findByIdAndUpdate(id, { active }, { new: true }).select('-password');
    return successResponse(res, 'Student status updated', student);
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Student.findByIdAndDelete(id);
    return successResponse(res, 'Student deleted', null);
  } catch (err) {
    next(err);
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const loginStudent = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);

    const student = await Student.findOne({ email: value.email });
    if (!student) return errorResponse(res, 'Invalid credentials', 401);

    const match = await bcrypt.compare(value.password, student.password);
    if (!match) return errorResponse(res, 'Invalid credentials', 401);

  // include both Mongo _id and student_id in the token so student can authenticate using either
  const token = jwt.sign({ id: student._id, student_id: student.student_id, role: 'student', email: student.email }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

  // Send login notification with geo/ip info (non-blocking) and log it
  try {
    const ip = getClientIp(req);
    const ipInfo = await fetchIpInfo(ip);
    await notify({ to: student.email, subject: 'Successful login', html: loginSuccessTemplate({ name: student.name, when: new Date().toUTCString(), ipInfo }), meta: { type: 'login', ip: ipInfo, studentId: student.student_id } });
  } catch (e) {
    console.error('Failed to send login email to student', e);
  }

  // Return token plus basic student info (including role, student_id and name)
  const payload = { token, user: { id: student._id, student_id: student.student_id, name: student.name, email: student.email, role: 'student' } };
  return successResponse(res, 'Login successful', payload);
  } catch (err) {
    next(err);
  }
};
