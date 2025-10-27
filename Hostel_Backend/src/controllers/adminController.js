import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import Joi from 'joi';
import dotenv from 'dotenv';
dotenv.config();

const adminCreateSchema = Joi.object({
  admin_id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const createAdmin = async (req, res, next) => {
  try {
    // Allow main_admin to optionally set the role when creating an admin
    const schema = adminCreateSchema.keys({ role: Joi.string().valid('admin','main_admin').optional() });
    const { error, value } = schema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);

    const existing = await Admin.findOne({ email: value.email });
    if (existing) return errorResponse(res, 'Admin with this email already exists', 400);

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(value.password, salt);
  const admin = new Admin({ ...value, role: value.role || 'admin', password: hashed });
    await admin.save();

    return successResponse(res, 'Admin created', { id: admin._id }, 201);
  } catch (err) {
    next(err);
  }
};

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const loginAdmin = async (req, res, next) => {
  try {
    const { error, value } = adminLoginSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);

    const admin = await Admin.findOne({ email: value.email });
    if (!admin) return errorResponse(res, 'Invalid credentials', 401);

    const match = await bcrypt.compare(value.password, admin.password);
    if (!match) return errorResponse(res, 'Invalid credentials', 401);

    const token = jwt.sign({ id: admin._id, role: admin.role, email: admin.email }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return successResponse(res, 'Login successful', { token });
  } catch (err) {
    next(err);
  }
};

export const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-password');
    return successResponse(res, 'Admins list', admins);
  } catch (err) {
    next(err);
  }
};

export const updateAdmin = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = req.body;
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }
    const admin = await Admin.findByIdAndUpdate(id, update, { new: true }).select('-password');
    return successResponse(res, 'Admin updated', admin);
  } catch (err) {
    next(err);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Admin.findByIdAndDelete(id);
    return successResponse(res, 'Admin deleted', null);
  } catch (err) {
    next(err);
  }
};
