export default (err, req, res, next) => {
  // If the error is a JSON parse error, log the raw body to help debugging
  if (err && err.type === 'entity.parse.failed') {
    console.error('[errorHandler] JSON parse error:', err.message);
    if (req && req.rawBody) {
      console.error('[errorHandler] rawBody:', req.rawBody);
    }
  } else {
    console.error(err);
  }
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;
  return res.status(status).json({ success: false, message, error: message, details });
};
