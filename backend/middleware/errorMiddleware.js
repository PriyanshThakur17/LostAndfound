// ============================================
// Campus Lost & Found — Error Handling Middleware
// ============================================
// Centralised error handler. All controllers
// call next(error) or next(createError(status, msg))
// instead of writing res.status().json() directly.
// ============================================

/**
 * notFound — catches requests to unknown routes.
 * Must be placed AFTER all valid route registrations.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler — global error formatter.
 * Returns a consistent JSON shape:
 *   { success: false, message: string, stack?: string }
 *
 * Handles:
 *  - Mongoose CastError (invalid ObjectId) → 400
 *  - Mongoose duplicate-key (11000)        → 409
 *  - Mongoose ValidationError              → 422
 *  - JWT errors                            → 401
 *  - All other errors                      → 500
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid resource ID format.';
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with that ${field} already exists.`;
  }

  // Mongoose: validation errors
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace in development only — never in production.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
