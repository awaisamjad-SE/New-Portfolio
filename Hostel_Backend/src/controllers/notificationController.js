import NotificationLog from '../models/NotificationLog.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getNotificationLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const page = parseInt(req.query.page || '1', 10);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const total = await NotificationLog.countDocuments(filter);
    const items = await NotificationLog.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    return successResponse(res, 'Notification logs', { total, page, limit, items });
  } catch (err) {
    next(err);
  }
};

export const getNotificationLogById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const item = await NotificationLog.findById(id).lean();
    if (!item) return errorResponse(res, 'Not found', 404);
    return successResponse(res, 'Notification log', item);
  } catch (err) {
    next(err);
  }
};
