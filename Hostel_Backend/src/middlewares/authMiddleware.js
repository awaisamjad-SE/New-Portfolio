import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { errorResponse } from "../utils/responseHandler.js";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // decoded should include role and id
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};
