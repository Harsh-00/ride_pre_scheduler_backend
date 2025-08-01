const Ride = require('../models/Ride');
const AdminAction = require('../models/AdminAction');
const sendResult = require('../utils/results');
const { BadRequestError } = require('../utils/errors');
const { validationResult } = require('express-validator');

exports.viewAllRides = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));

  const { user, status, date } = req.query;
  const filter = {};
  if (user) filter.user = user;
  if (status) filter.status = status;
  if (date) {
    const targetDate = new Date(date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    filter.datetime = { $gte: targetDate, $lt: nextDate };
  }
  const rides = await Ride.find(filter).populate('user', 'name email employeeId');
  sendResult(res, true,"Rides fetched successfully", rides);
};

exports.approveRejectRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new BadRequestError(errors.array()[0].msg));

    const { action } = req.body;
    const validActions = ['Approved', 'Rejected'];
    if (!validActions.includes(action)) return next(new BadRequestError('Invalid action'));

    const newStatus = action;
    const ride = await Ride.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      { status: newStatus },
      { new: true }
    );
    if (!ride) return next(new BadRequestError('Ride not pending or not found'));
    await AdminAction.create({ ride: ride._id, admin: req.user._id, action: newStatus });
    sendResult(res, true, "Ride status updated successfully", ride);
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res) => { 
  try {
    // 1) Summary 
    const summary = await Ride.aggregate([
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          cancelledRides: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          approvedRides: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } }
        }
      }
    ]);
    const {
      totalRides = 0,
      uniqueUsers: uniqueUsersArr = [],
      cancelledRides = 0,
      approvedRides = 0
    } = summary[0] || {};

    const uniqueUsers = uniqueUsersArr.length;
    const approvalRate = totalRides
      ? parseFloat(((approvedRides / totalRides) * 100).toFixed(1))
      : 0;
    const avgRidesPerUser = uniqueUsers
      ? parseFloat((totalRides / uniqueUsers).toFixed(1))
      : 0;

    // 2) Daily statistics
    const dailyStats = await Ride.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$datetime' } },
          total:     { $sum: 1 },
          approved:  { $sum: { $cond: [{ $eq: ['$status','Approved'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status','Cancelled'] }, 1, 0] } },
          pending:   { $sum: { $cond: [{ $eq: ['$status','Pending'] }, 1, 0] } }
        }
      },
      { $sort: { '_id': 1 } },
      { $project: {
          date:      '$_id',
          _id:       0,
          total:     1,
          approved:  1,
          cancelled: 1,
          pending:   1
        }
      }
    ]);

    // 3) Top users (with user names)
    const topUsers = await Ride.aggregate([
      { $group: { _id: '$user', rides: { $sum: 1 } } },
      { $sort: { rides: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: {
          userId: '$user._id',
          name:   '$user.name',
          rides:  1,
          _id:    0
        }
      }
    ]);

    // 4) Rides per user per day grouped by date with nested rides array
    const ridesPerUserPerDay = await Ride.aggregate([ 
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$datetime' } },
            user: '$user'
          },
          rides: { $sum: 1 }
        }
      },
      // Join user details
      {
        $lookup: {
          from: 'users',
          localField: '_id.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      // Prepare flat records
      {
        $project: {
          date:   '$_id.date',
          userId: '$user._id',
          name:   '$user.name',
          rides:  1,
          _id:    0
        }
      },
      // Group by date to nest user ride info
      {
        $group: {
          _id: '$date',
          rides: { $push: { userId: '$userId', name: '$name', rides: '$rides' } }
        }
      },
      // Format output
      {
        $project: {
          date: '$_id',
          rides: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);


    sendResult(res, true, "Analytics fetched successfully", { summary:{
        totalRides,
        uniqueUsers,
        cancelledRides,
        approvedRides,
        approvalRate,
        avgRidesPerUser
      }, 
      dailyStats, 
      topUsers,
      ridesPerUserPerDay
    });
  } catch (err) {
    next(err);
  }
};

