import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import Joi from 'joi';
import dotenv from 'dotenv';
dotenv.config();
import { sendMail } from '../utils/mail.js';
import { welcomeTemplate, loginSuccessTemplate } from '../utils/emailTemplates.js';
import { notify } from '../utils/notifier.js';
import { getClientIp, fetchIpInfo } from '../utils/ipinfo.js';

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

    // Send welcome email (non-blocking) and log it
    try {
      await notify({ to: admin.email, subject: 'Welcome to Hostel Management', html: welcomeTemplate({ name: admin.name, id: admin.admin_id, role: admin.role }), meta: { type: 'welcome', userId: admin._id } });
    } catch (e) {
      console.error('Failed to send welcome email to admin', e);
    }

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

    // Send login notification with geo/ip info (non-blocking) and log it
    try {
      const ip = getClientIp(req);
      const ipInfo = await fetchIpInfo(ip);
      await notify({ to: admin.email, subject: 'Successful login', html: loginSuccessTemplate({ name: admin.name, when: new Date().toUTCString(), ipInfo }), meta: { type: 'login', ip: ipInfo } });
    } catch (e) {
      console.error('Failed to send login email to admin', e);
    }

  // Return token plus basic user info (including role and name) so clients can use it without decoding JWT immediately
  const payload = { token, user: { id: admin._id, admin_id: admin.admin_id, name: admin.name, email: admin.email, role: admin.role } };
    return successResponse(res, 'Login successful', payload);
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
    // Notify admin about profile changes (non-blocking)
    try {
      if (admin && admin.email) {
        await notify({ to: admin.email, subject: 'Your admin account was updated', html: welcomeTemplate({ name: admin.name, id: admin.admin_id, role: admin.role }), meta: { type: 'admin-update', userId: admin._id } });
      }
    } catch (e) {
      console.error('Failed to send admin update email', e);
    }

    return successResponse(res, 'Admin updated', admin);
  } catch (err) {
    next(err);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const id = req.params.id;
    const admin = await Admin.findByIdAndDelete(id);
    // Notify admin about deletion (best-effort)
    try {
      if (admin && admin.email) {
        await notify({ to: admin.email, subject: 'Your admin account was removed', html: `<p>Your admin account (${admin.email}) has been removed by a main administrator.</p>`, meta: { type: 'admin-delete', userId: admin._id } });
      }
    } catch (e) {
      console.error('Failed to send admin deletion email', e);
    }

    return successResponse(res, 'Admin deleted', null);
  } catch (err) {
    next(err);
  }
};
