const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace for debugging
  
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if no status code is set
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
    });
  };
  
  module.exports = errorHandler;
  