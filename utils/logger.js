// Simple logging utility
const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  },
  
  error: (message, data = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data);
  },
  
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  },
  
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  },
  
  // Log API requests
  logApiRequest: (req, res, next) => {
    const start = Date.now();
    
    // Log when the request completes
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
      };
      
      // Add user ID if authenticated
      if (req.user && req.user.userId) {
        logData.userId = req.user.userId;
        logData.userRole = req.user.role;
      }
      
      // Log at appropriate level based on status code
      if (res.statusCode >= 500) {
        logger.error(`API Request Failed: ${req.method} ${req.originalUrl}`, logData);
      } else if (res.statusCode >= 400) {
        logger.warn(`API Request Error: ${req.method} ${req.originalUrl}`, logData);
      } else {
        logger.info(`API Request: ${req.method} ${req.originalUrl}`, logData);
      }
    });
    
    next();
  }
};

module.exports = logger;