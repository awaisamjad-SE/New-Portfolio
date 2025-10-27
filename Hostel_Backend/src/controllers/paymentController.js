import MonthlyPayment from "../models/MonthlyPayment.js";
import Student from "../models/Student.js";
import Joi from 'joi';
import { successResponse, errorResponse } from "../utils/responseHandler.js";

const createSchema = Joi.object({
  student_id: Joi.string().required(),
  month: Joi.string().required(),
  total_food_price: Joi.number().default(0),
  mess_service_charge: Joi.number().default(0),
  variable_expenses: Joi.number().default(0),
  payment_mode: Joi.string().optional()
});

export const generatePayment = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);

    const total = (value.total_food_price || 0) + (value.mess_service_charge || 0) + (value.variable_expenses || 0);
    const payment = new MonthlyPayment({ ...value, total_amount: total, payment_status: 'pending' });
    await payment.save();
    return successResponse(res, 'Payment generated', payment, 201);
  } catch (err) {
    next(err);
  }
};

export const generatePaymentsForAll = async (req, res, next) => {
  try {
    // naive: for each student create payment entry with defaults or calculated
    const students = await Student.find();
    const month = req.body.month;
    if(!month) return errorResponse(res, 'Month is required', 400);

    const payments = [];
    for(const s of students) {
      const payment = new MonthlyPayment({ student_id: s.student_id, month, total_amount: 0, payment_status: 'pending' });
      await payment.save();
      payments.push(payment);
    }
    return successResponse(res, 'Payments generated for all students', payments, 201);
  } catch (err) {
    next(err);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const payments = await MonthlyPayment.find();
    return successResponse(res, 'Payments list', payments);
  } catch (err) {
    next(err);
  }
};

export const getPaymentsByStudent = async (req, res, next) => {
  try {
    const sid = req.params.student_id;
    if (req.user.role === 'student') {
      const allowed = String(req.user.id) === String(sid) || String(req.user.student_id) === String(sid);
      if (!allowed) return errorResponse(res, 'Access denied', 403);
    }
    const payments = await MonthlyPayment.find({ student_id: sid });
    return successResponse(res, 'Student payments', payments);
  } catch (err) {
    next(err);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const payment = await MonthlyPayment.findByIdAndUpdate(id, update, { new: true });
    return successResponse(res, 'Payment updated', payment);
  } catch (err) {
    next(err);
  }
};
