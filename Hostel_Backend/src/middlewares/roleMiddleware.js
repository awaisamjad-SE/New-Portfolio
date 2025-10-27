import { errorResponse } from '../utils/responseHandler.js';

export const verifyRole = (allowedRoles = []) => (req, res, next) => {
  const user = req.user;
  if (!user) {
    return errorResponse(res, 'Unauthorized - token missing or invalid', 401);
  }

  const role = user.role;
  // If role is missing in the token, treat as unauthorized
  if (!role) return errorResponse(res, 'Unauthorized - role missing in token', 401);

  // Allow main_admin to perform any action (hierarchical privilege)
  if (role === 'main_admin') return next();

  if (!allowedRoles.includes(role)) {
    return errorResponse(res, 'Access denied - insufficient role', 403);
  }

  next();
};
