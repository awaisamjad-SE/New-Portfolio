import FoodItem from "../models/FoodItem.js";
import Joi from 'joi';
import { successResponse, errorResponse } from "../utils/responseHandler.js";

const createSchema = Joi.object({
  food_id: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().optional(),
  price: Joi.number().required(),
});

export const createFoodItem = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, 400);

    const existing = await FoodItem.findOne({ food_id: value.food_id });
    if (existing) return errorResponse(res, 'Food item with this id already exists', 400);

    const item = new FoodItem({ ...value, added_by: req.user ? req.user.id : null });
    await item.save();
    return successResponse(res, 'Food item created', item, 201);
  } catch (err) {
    next(err);
  }
};

export const getFoodItems = async (req, res, next) => {
  try {
    const items = await FoodItem.find();
    return successResponse(res, 'Food items', items);
  } catch (err) {
    next(err);
  }
};

export const updateFoodItem = async (req, res, next) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const item = await FoodItem.findByIdAndUpdate(id, update, { new: true });
    return successResponse(res, 'Food item updated', item);
  } catch (err) {
    next(err);
  }
};

export const deleteFoodItem = async (req, res, next) => {
  try {
    const id = req.params.id;
    await FoodItem.findByIdAndDelete(id);
    return successResponse(res, 'Food item deleted', null);
  } catch (err) {
    next(err);
  }
};
