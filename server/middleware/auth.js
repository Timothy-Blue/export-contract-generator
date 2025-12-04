/**
 * Authentication Middleware
 * Implements API key-based authentication for write operations
 */

const authenticateAPIKey = (req, res, next) => {
  // Skip authentication for GET requests (read-only)
  if (req.method === 'GET') {
    return next();
  }

  // Get API key from headers
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  // Check if API key exists
  if (!apiKey) {
    return res.status(401).json({ 
      message: 'Authentication required. Please provide an API key.',
      error: 'Missing API key'
    });
  }

  // Verify API key matches environment variable
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.error('API_KEY environment variable is not set!');
    return res.status(500).json({ 
      message: 'Server configuration error',
      error: 'API key not configured'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ 
      message: 'Invalid API key',
      error: 'Access denied'
    });
  }

  // API key is valid, proceed
  next();
};

/**
 * Rate limiting helper
 * Track API calls per IP address
 */
const rateLimitMap = new Map();

const rateLimit = (windowMs = 60000, maxRequests = 100) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip);
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.',
        error: 'Rate limit exceeded'
      });
    }
    
    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);
    
    next();
  };
};

/**
 * Input validation middleware
 * Sanitize inputs to prevent injection attacks
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potential script tags or suspicious patterns
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  authenticateAPIKey,
  rateLimit,
  sanitizeInput
};
