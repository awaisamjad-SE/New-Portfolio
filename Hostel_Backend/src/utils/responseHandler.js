export const successResponse = (res, message = 'OK', data = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (res, message = 'Error', statusCode = 500, details = null) => {
  return res.status(statusCode).json({ success: false, message, error: message, details });
};
