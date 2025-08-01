const User = require('../models/User');

const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) return next(new UnauthorizedError('No token provided'));
    const user = await User.findOne({ token });
    if (!user) return next(new UnauthorizedError('Invalid token'));
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return next(new ForbiddenError('Admin only'));
    next();
};

exports.requireUser = (req, res, next) => {
    if (req.user.role !== 'user') return next(new ForbiddenError('User only'));
    next();
};