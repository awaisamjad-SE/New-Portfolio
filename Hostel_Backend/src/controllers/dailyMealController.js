import DailyMeal from "../models/DailyMeal.js";
import Joi from 'joi';
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import FoodItem from "../models/FoodItem.js";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import { notify } from '../utils/notifier.js';
import { mealNotificationTemplate, monthlyReportTemplate, weeklyReportTemplate } from '../utils/emailTemplates.js';

const createSchema = Joi.object({
  student_id: Joi.string().required(),
  food_id: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  date: Joi.date().optional()
});

export const addDailyMeal = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);

    const meal = new DailyMeal({ ...value, added_by: req.user ? req.user.id : null });
    await meal.save();

    // Notify student about the added meal (non-blocking)
    (async () => {
      try {
        // Fetch related records for richer email
        const [food, student, addedByAdmin] = await Promise.all([
          FoodItem.findOne({ food_id: meal.food_id }).lean(),
          Student.findOne({ student_id: meal.student_id }).lean(),
          meal.added_by ? Admin.findById(meal.added_by).lean() : null
        ]);

        const price = (food && typeof food.price !== 'undefined') ? Number(food.price) : 0;
        const total = (price * (meal.quantity || 1));

        const html = mealNotificationTemplate({
          studentName: student ? student.name : meal.student_id,
          action: 'added',
          foodName: food ? food.name : meal.food_id,
          quantity: meal.quantity,
          date: meal.date ? new Date(meal.date).toLocaleString() : new Date().toLocaleString(),
          price,
          total,
          addedBy: addedByAdmin ? addedByAdmin.name : 'Administrator'
        });

        const to = student && student.email ? student.email : null;
        if (to) {
          await notify({ to, subject: 'Meal added to your account', html, meta: { type: 'meal-added', mealId: meal._id, studentId: meal.student_id } });
        }
      } catch (e) {
        console.error('Failed to send meal notification email', e);
      }
    })();

    return successResponse(res, 'Daily meal added', meal, 201);
  } catch (err) {
    next(err);
  }
};

export const getDailyMeals = async (req, res, next) => {
  try {
    const meals = await DailyMeal.find();
    return successResponse(res, 'Daily meals', meals);
  } catch (err) {
    next(err);
  }
};

export const getMealsByStudent = async (req, res, next) => {
  try {
    const sid = req.params.student_id;
    // ensure req.user exists and enforce student-scoped access
    if (!req.user) return errorResponse(res, 'Unauthorized - token required', 401);
    if (req.user && req.user.role === 'student') {
      const allowed = String(req.user.id) === String(sid) || String(req.user.student_id) === String(sid);
      if (!allowed) return errorResponse(res, 'Access denied', 403);
    }
    const meals = await DailyMeal.find({ student_id: sid });
    return successResponse(res, 'Student meals', meals);
  } catch (err) {
    next(err);
  }
};

export const updateDailyMeal = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const meal = await DailyMeal.findByIdAndUpdate(id, update, { new: true });
    return successResponse(res, 'Daily meal updated', meal);
  } catch (err) {
    next(err);
  }
};

export const deleteDailyMeal = async (req, res, next) => {
  try {
    const id = req.params.id;
    await DailyMeal.findByIdAndDelete(id);
    return successResponse(res, 'Daily meal deleted', null);
  } catch (err) {
    next(err);
  }
};

export const getMonthlyMealsSummary = async (req, res, next) => {
  try {
    const month = req.params.month;
    if (!month) return errorResponse(res, 'Month is required', 400);
    const [y, m] = (month || '').split('-').map(Number);
    if (!y || !m) return errorResponse(res, 'Invalid month format. Expected YYYY-MM', 400);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const agg = await DailyMeal.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $lookup: { from: 'fooditems', localField: 'food_id', foreignField: 'food_id', as: 'food' } },
      { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
      { $addFields: { price: { $ifNull: ['$food.price', 0] }, line_total: { $multiply: ['$quantity', { $ifNull: ['$food.price', 0] }] } } },
      { $group: { _id: { day: { $dayOfMonth: '$date' } }, total_meals: { $sum: '$quantity' }, total_revenue: { $sum: '$line_total' } } },
      { $sort: { '_id.day': 1 } }
    ]);
    return successResponse(res, 'Monthly meals summary', agg);
  } catch (err) {
    next(err);
  }
};

export const getPopularFoods = async (req, res, next) => {
  try {
    const month = req.params.month;
    const topN = parseInt(req.query.n || '10', 10);
    if (!month) return errorResponse(res, 'Month is required', 400);
    const [y, m] = (month || '').split('-').map(Number);
    if (!y || !m) return errorResponse(res, 'Invalid month format. Expected YYYY-MM', 400);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const agg = await DailyMeal.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: '$food_id', count: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
      { $limit: topN },
      { $lookup: { from: 'fooditems', localField: '_id', foreignField: 'food_id', as: 'food' } },
      { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
      { $project: { food_id: '$_id', name: '$food.name', count: 1 } }
    ]);
    return successResponse(res, 'Popular foods', agg);
  } catch (err) {
    next(err);
  }
};

// Send monthly meal report to all students (main_admin only)
export const sendMonthlyReportToAll = async (req, res, next) => {
  try {
    const month = req.body.month || req.query.month; // expect YYYY-MM
    if (!month) return errorResponse(res, 'month is required (YYYY-MM)', 400);
    const [y, m] = (month || '').split('-').map(Number);
    if (!y || !m) return errorResponse(res, 'Invalid month format. Expected YYYY-MM', 400);

    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const students = await Student.find().lean();
    const results = [];

    for (const s of students) {
      try {
        const agg = await DailyMeal.aggregate([
          { $match: { student_id: s.student_id, date: { $gte: start, $lt: end } } },
          { $lookup: { from: 'fooditems', localField: 'food_id', foreignField: 'food_id', as: 'food' } },
          { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
          { $project: { date: 1, foodName: { $ifNull: ['$food.name', '$food_id'] }, quantity: 1, price: { $ifNull: ['$food.price', 0] }, line_total: { $multiply: ['$quantity', { $ifNull: ['$food.price', 0] }] } } },
          { $sort: { date: 1 } }
        ]);

        const items = agg.map(a => ({ date: new Date(a.date).toLocaleString(), foodName: a.foodName, quantity: a.quantity, price: a.price, line_total: a.line_total }));
        const total = items.reduce((s2, it) => s2 + (it.line_total || 0), 0);

        const html = monthlyReportTemplate({ studentName: s.name, studentId: s.student_id, month, items, total });
        if (s.email) {
          const r = await notify({ to: s.email, subject: `Your monthly meal report — ${month}`, html, meta: { type: 'monthly-report', month, studentId: s.student_id } });
          results.push({ student_id: s.student_id, email: s.email, status: r.status, total, logId: r.logId });
        } else {
          results.push({ student_id: s.student_id, email: null, status: 'no-email' });
        }
      } catch (e) {
        results.push({ student_id: s.student_id, email: s.email || null, status: 'error', error: String(e && e.message ? e.message : e) });
      }
    }

    return successResponse(res, 'Monthly reports processed', { month, results });
  } catch (err) {
    next(err);
  }
};

// Send weekly meal report to all students (main_admin only)
export const sendWeeklyReportToAll = async (req, res, next) => {
  try {
    const startDate = req.body.startDate || req.query.startDate; // expect YYYY-MM-DD
    if (!startDate) return errorResponse(res, 'startDate is required (YYYY-MM-DD)', 400);
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return errorResponse(res, 'Invalid startDate', 400);
    // week is 7 days from start (inclusive)
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const students = await Student.find().lean();
    const results = [];

    for (const s of students) {
      try {
        const agg = await DailyMeal.aggregate([
          { $match: { student_id: s.student_id, date: { $gte: start, $lt: end } } },
          { $lookup: { from: 'fooditems', localField: 'food_id', foreignField: 'food_id', as: 'food' } },
          { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
          { $project: { date: 1, foodName: { $ifNull: ['$food.name', '$food_id'] }, quantity: 1, price: { $ifNull: ['$food.price', 0] }, line_total: { $multiply: ['$quantity', { $ifNull: ['$food.price', 0] }] } } },
          { $sort: { date: 1 } }
        ]);

        const items = agg.map(a => ({ date: new Date(a.date).toLocaleString(), foodName: a.foodName, quantity: a.quantity, price: a.price, line_total: a.line_total }));
        const total = items.reduce((s2, it) => s2 + (it.line_total || 0), 0);

        const weekStart = start.toISOString().slice(0,10);
        const weekEnd = new Date(end - 1).toISOString().slice(0,10);

        const html = weeklyReportTemplate({ studentName: s.name, studentId: s.student_id, weekStart, weekEnd, items, total });
        if (s.email) {
          const r = await notify({ to: s.email, subject: `Your weekly meal report — ${weekStart} to ${weekEnd}`, html, meta: { type: 'weekly-report', start: weekStart, end: weekEnd, studentId: s.student_id } });
          results.push({ student_id: s.student_id, email: s.email, status: r.status, total, logId: r.logId });
        } else {
          results.push({ student_id: s.student_id, email: null, status: 'no-email' });
        }
      } catch (e) {
        results.push({ student_id: s.student_id, email: s.email || null, status: 'error', error: String(e && e.message ? e.message : e) });
      }
    }

    return successResponse(res, 'Weekly reports processed', { start: start.toISOString(), end: end.toISOString(), results });
  } catch (err) {
    next(err);
  }
};
