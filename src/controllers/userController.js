const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendResult = require('../utils/results');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

exports.authenticateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));

    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email });
    if (!user) return next(new UnauthorizedError('Invalid credentials'));
    const match = await bcrypt.compare(password, user.password);
    if (!match) return next(new UnauthorizedError('Invalid credentials'));
    sendResult(res, true, "User authenticated successfully", { token: user.token, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));

    const { name, email, password, role, employeeId } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(8).toString('hex'); 
    
    const user = new User({ name, email, password: hashed, role, employeeId, token });
    await user.save();
    sendResult(res, true, "User created successfully", user, 201);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = (req, res) => {
  try {
    const { name, email, role, employeeId, createdAt, updatedAt } = req.user;
    const user = { name, email, role, employeeId, createdAt, updatedAt };

    sendResult(res, true, "User profile fetched successfully", user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));
    const { name, email, password } = req.body;
    if (name) req.user.name = name;
    if (email) req.user.email = email;
    if (password) req.user.password = await bcrypt.hash(password, 10);
    await req.user.save();
    sendResult(res, true, "User profile updated successfully", req.user);
  } catch (err) {
    next(err);
  }
};


//Extra Endpoint 

exports.updateUserByAdmin = async (req, res, next) => {
  // by this admin can update any details of any user (no restriction)
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));

    const { name, email, password, role, employeeId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return next(new NotFoundError('User not found'));
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;
    if (employeeId) user.employeeId = employeeId;
    await user.save();
    sendResult(res, true, "User Details Updated Successfully", user);
  } catch (err) {
    next(err);
  }
};

