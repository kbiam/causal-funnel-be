const errorHandler = (error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  let status = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = error.message;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid data format';
    code = 'INVALID_FORMAT';
  } else if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Duplicate entry';
    code = 'DUPLICATE_ENTRY';
  }

  res.status(status).json({ 
    error: message,
    code: code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = { errorHandler };