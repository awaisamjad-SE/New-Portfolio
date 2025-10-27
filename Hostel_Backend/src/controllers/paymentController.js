import MonthlyPayment from "../models/MonthlyPayment.js";
import Student from "../models/Student.js";
import DailyMeal from "../models/DailyMeal.js";
import FoodItem from "../models/FoodItem.js";
import Joi from 'joi';
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import { notify } from '../utils/notifier.js';
import { paymentNotificationTemplate } from '../utils/emailTemplates.js';

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

    // prevent duplicate payments for same student+month
    const exists = await MonthlyPayment.findOne({ student_id: value.student_id, month: value.month });
    if (exists) return errorResponse(res, 'Payment already generated for this student and month', 409);

    // If total_food_price is not provided or is 0, compute it from DailyMeal + FoodItem prices
    let totalFood = value.total_food_price || 0;
    if (!totalFood || totalFood === 0) {
      // parse month YYYY-MM
      const [y, m] = (value.month || '').split('-').map(Number);
      if (!y || !m) return errorResponse(res, 'Invalid month format. Expected YYYY-MM', 400);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 1));

      const agg = await DailyMeal.aggregate([
        { $match: { student_id: value.student_id, date: { $gte: start, $lt: end } } },
        { $lookup: { from: 'fooditems', localField: 'food_id', foreignField: 'food_id', as: 'food' } },
        { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
        { $addFields: { price: { $ifNull: ['$food.price', 0] }, line_total: { $multiply: ['$quantity', { $ifNull: ['$food.price', 0] }] } } },
        { $group: { _id: null, total: { $sum: '$line_total' } } }
      ]);
      totalFood = (agg && agg[0] && agg[0].total) ? agg[0].total : 0;
    }

    const total = totalFood + (value.mess_service_charge || 0) + (value.variable_expenses || 0);
    const payment = new MonthlyPayment({ ...value, total_food_price: totalFood, total_amount: total, payment_status: 'pending' });
    await payment.save();
    // Send payment notification to the student (non-blocking)
    (async () => {
      try {
        const student = await Student.findOne({ student_id: payment.student_id }).lean();
        if (student && student.email) {
          const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
          const payUrl = `${base}/payments/pay/${payment._id}`;
          await notify({ to: student.email, subject: `Payment generated for ${payment.month}`, html: paymentNotificationTemplate({ studentName: student.name, studentId: student.student_id, month: payment.month, total: payment.total_amount, payUrl, paymentId: payment._id }), meta: { type: 'payment-generated', paymentId: payment._id, studentId: student.student_id } });
        }
      } catch (e) {
        console.error('Failed to send payment notification', e);
      }
    })();

    return successResponse(res, 'Payment generated', payment, 201);
  } catch (err) {
    next(err);
  }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const { student_id, month } = req.params;
    if (!student_id || !month) return errorResponse(res, 'student_id and month are required', 400);

    // admin-only endpoint (route should be protected)

    // compute totals and return daily items
    const [y, m] = (month || '').split('-').map(Number);
    if (!y || !m) return errorResponse(res, 'Invalid month format. Expected YYYY-MM', 400);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const items = await DailyMeal.aggregate([
      { $match: { student_id, date: { $gte: start, $lt: end } } },
      { $lookup: { from: 'fooditems', localField: 'food_id', foreignField: 'food_id', as: 'food' } },
      { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
      { $project: { date: 1, food_id: 1, quantity: 1, price: { $ifNull: ['$food.price', 0] }, line_total: { $multiply: ['$quantity', { $ifNull: ['$food.price', 0] }] } } },
      { $sort: { date: 1 } }
    ]);

    const totalFood = items.reduce((s, it) => s + (it.line_total || 0), 0);

    return successResponse(res, 'Monthly report', { student_id, month, total_food_price: totalFood, items });
  } catch (err) {
    next(err);
  }
};

export const getStudentPaymentsTrend = async (req, res, next) => {
  try {
    const sid = req.params.student_id;
    if (!req.user) return errorResponse(res, 'Unauthorized - token required', 401);
    if (req.user && req.user.role === 'student') {
      const allowed = String(req.user.id) === String(sid) || String(req.user.student_id) === String(sid);
      if (!allowed) return errorResponse(res, 'Access denied', 403);
    }

    // group payments by month and sum
    const agg = await MonthlyPayment.aggregate([
      { $match: { student_id: sid } },
      { $group: { _id: '$month', total_amount: { $sum: '$total_amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, 'Student payments trend', agg);
  } catch (err) {
    next(err);
  }
};

export const getPaymentsSummary = async (req, res, next) => {
  try {
    // admin endpoint - overall summary grouped by month
    const agg = await MonthlyPayment.aggregate([
      { $group: { _id: '$month', total_amount: { $sum: '$total_amount' }, payments: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    return successResponse(res, 'Payments summary', agg);
  } catch (err) {
    next(err);
  }
};

export const markPaymentPaid = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { payment_mode, payment_reference, paid_at } = req.body;
    const update = {
      payment_status: 'paid',
      payment_mode: payment_mode || 'unknown',
      payment_reference: payment_reference || null,
      paid_at: paid_at ? new Date(paid_at) : new Date(),
      updated_by: req.user ? req.user.id : null
    };
    const payment = await MonthlyPayment.findByIdAndUpdate(id, update, { new: true });
    return successResponse(res, 'Payment marked as paid', payment);
  } catch (err) {
    next(err);
  }
};

export const getTopExpenses = async (req, res, next) => {
  try {
    const month = req.params.month;
    const topN = parseInt(req.query.n || '10', 10);
    if (!month) return errorResponse(res, 'Month is required', 400);

    const agg = await MonthlyPayment.aggregate([
      { $match: { month } },
      { $group: { _id: '$student_id', total_amount: { $sum: '$total_amount' } } },
      { $sort: { total_amount: -1 } },
      { $limit: topN }
    ]);
    return successResponse(res, 'Top expenses', agg);
  } catch (err) {
    next(err);
  }
};

export const generatePaymentsForAll = async (req, res, next) => {
  try {
    // For each student, compute total_food_price from meals in the month and create payment & notify
    const students = await Student.find().lean();
    const month = req.body.month;
    if (!month) return errorResponse(res, 'Month is required', 400);

    const [y, m] = (month || '').split('-').map(Number);
    if (!y || !m) return errorResponse(res, 'Invalid month format. Expected YYYY-MM', 400);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const payments = [];
    for (const s of students) {
      try {
        const agg = await DailyMeal.aggregate([
          { $match: { student_id: s.student_id, date: { $gte: start, $lt: end } } },
          { $lookup: { from: 'fooditems', localField: 'food_id', foreignField: 'food_id', as: 'food' } },
          { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
          { $addFields: { price: { $ifNull: ['$food.price', 0] }, line_total: { $multiply: ['$quantity', { $ifNull: ['$food.price', 0] }] } } },
          { $group: { _id: null, total: { $sum: '$line_total' } } }
        ]);
        const totalFood = (agg && agg[0] && agg[0].total) ? agg[0].total : 0;
        const totalAmount = totalFood; // mess_service_charge/variable_expenses not provided here
        const payment = new MonthlyPayment({ student_id: s.student_id, month, total_food_price: totalFood, total_amount: totalAmount, payment_status: 'pending' });
        await payment.save();
        payments.push(payment);

        // notify student if email present (non-blocking)
        if (s.email) {
          try {
            const base = process.env.BASE_URL || (req ? `${req.protocol}://${req.get('host')}` : '');
            const payUrl = `${base}/payments/pay/${payment._id}`;
            await notify({ to: s.email, subject: `Payment generated for ${month}`, html: paymentNotificationTemplate({ studentName: s.name, studentId: s.student_id, month, total: payment.total_amount, payUrl, paymentId: payment._id }), meta: { type: 'payment-generated-bulk', paymentId: payment._id, studentId: s.student_id } });
          } catch (e) {
            console.error('Failed to send payment email for student', s.student_id, e);
          }
        }
      } catch (e) {
        console.error('Failed to generate payment for student', s.student_id, e);
      }
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
    if (!req.user) return errorResponse(res, 'Unauthorized - token required', 401);
    if (req.user && req.user.role === 'student') {
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
    // Notify student about payment update (non-blocking)
    (async () => {
      try {
        const student = await Student.findOne({ student_id: payment.student_id }).lean();
        if (student && student.email) {
          const base = process.env.BASE_URL || '';
          const payUrl = `${base}/payments/pay/${payment._id}`;
          await notify({ to: student.email, subject: `Payment updated for ${payment.month}`, html: paymentNotificationTemplate({ studentName: student.name, studentId: student.student_id, month: payment.month, total: payment.total_amount, payUrl, paymentId: payment._id }), meta: { type: 'payment-updated', paymentId: payment._id, studentId: student.student_id } });
        }
      } catch (e) {
        console.error('Failed to send payment update email', e);
      }
    })();

    return successResponse(res, 'Payment updated', payment);
  } catch (err) {
    next(err);
  }
};
