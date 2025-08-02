const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const rideCtrl = require('../controllers/rideController');

const router = express.Router();

router.post(
    '/',
    auth.verifyToken,
    auth.requireUser,
    body('pickup').notEmpty(),
    body('dropoff').notEmpty(),
    body('datetime').notEmpty().isISO8601(),
    rideCtrl.createRide
);
router.get('/', auth.verifyToken, auth.requireUser, rideCtrl.getUserRides);
router.get('/:id', auth.verifyToken, auth.requireUser, rideCtrl.getRide);
router.patch('/:id/cancel', auth.verifyToken, auth.requireUser, rideCtrl.cancelRide);

module.exports = router;
  