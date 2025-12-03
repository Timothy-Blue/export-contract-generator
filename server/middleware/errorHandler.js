/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

/**
 * @desc    Handle 404 errors (Not Found)
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * @desc    Custom error handler
 * @note    This should be the last middleware in the chain
 */
exports.errorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Send error response
  res.json({
    message: err.message,
    // Only send stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // Include validation errors if present
    errors: err.errors || undefined
  });
};

/**
 * @desc    Async handler wrapper to catch async errors
 * @param   {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function that catches errors
 * @usage   router.get('/', asyncHandler(async (req, res) => {...}))
 */
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Validation error handler
 * @param   {Array} errors - Array of validation errors
 */
exports.validationError = (errors) => {
  const error = new Error('Validation failed');
  error.errors = errors;
  return error;
};
