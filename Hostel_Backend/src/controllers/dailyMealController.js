import DailyMeal from "../models/DailyMeal.js";
import Joi from 'joi';
import { successResponse, errorResponse } from "../utils/responseHandler.js";

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
