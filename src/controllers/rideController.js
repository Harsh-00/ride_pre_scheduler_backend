const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/errors');
const { validationResult } = require('express-validator');
const sendResult = require('../utils/results');
const Ride = require('../models/Ride');

exports.createRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));

    const { pickup, dropoff, datetime } = req.body;
    if (!pickup || !dropoff || !datetime) return next(new BadRequestError('Missing fields'));
    if (new Date(datetime) < new Date()) return next(new BadRequestError('Cannot book past datetime'));

    // Prevent overlapping bookings
    const overlap = await Ride.findOne({ user: req.user._id, datetime });
    if (overlap) return next(new BadRequestError('Overlap booking'));

    const ride = new Ride({ user: req.user._id, pickup, dropoff, datetime });
      await ride.save();
      sendResult(res, true, "Ride created successfully", ride, 201);
  } catch (err) {
    next(err);
  }
};

exports.getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id }).sort('datetime');
    sendResult(res, true, "Rides fetched successfully", rides);
  } catch (err) {
    next(err);
  }
};

exports.getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return next(new NotFoundError('Ride not found'));
    if (!ride.user.equals(req.user._id)) return next(new ForbiddenError('Access denied'));
    sendResult(res, true, "Ride fetched successfully", ride);
  } catch (err) {
    next(err);
  }
};

exports.cancelRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));

    const invalidStatuses = ['Cancelled','Rejected'];
    const ride = await Ride.findById(req.params.id);
    if (!ride) return next(new NotFoundError('Ride not found'));
    if (!ride.user.equals(req.user._id)) return next(new ForbiddenError('Access denied'));
    if (invalidStatuses.includes(ride.status)) return next(new BadRequestError('Cannot cancel'));

    ride.status = 'Cancelled';
    await ride.save();
    sendResult(res, true, "Ride cancelled successfully", ride);
  } catch (err) {
    next(err);
  }
};