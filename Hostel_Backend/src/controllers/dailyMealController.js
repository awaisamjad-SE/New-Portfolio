import DailyMeal from "../models/DailyMeal.js";
import Joi from 'joi';
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import FoodItem from "../models/FoodItem.js";

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
    // allow student access if token contains matching mongo id or student_id
    if (req.user.role === 'student') {
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
