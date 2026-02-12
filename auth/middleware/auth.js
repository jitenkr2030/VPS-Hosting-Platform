const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { Session } = require('../models/Session');
const { logger } = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find session
    const session = await Session.findActiveByToken(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session.'
      });
    }

    // Check if user still exists and is active
    if (!session.userId || session.userId.status !== 'active') {
      await session.deactivate();
      return res.status(401).json({
        success: false,
        message: 'Account is not active.'
      });
    }

    // Update last activity
    await session.updateLastActivity();

    // Add user and session to request
    req.user = session.userId;
    req.session = session;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const session = await Session.findActiveByToken(token);
      
      if (session && session.userId && session.userId.status === 'active') {
        await session.updateLastActivity();
        req.user = session.userId;
        req.session = session;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Optional auth means we continue even if auth fails
    next();
  }
};

module.exports = { auth, authorize, optionalAuth };