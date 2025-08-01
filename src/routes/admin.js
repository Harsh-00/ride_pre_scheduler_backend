const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

const router = express.Router();

router.get(
    '/rides',
    auth.verifyToken,
    auth.requireAdmin,
    query('status').optional().isIn(['Pending','Approved','Rejected','Cancelled']),
    query('user').optional().isMongoId(),
    query('date').optional().isDate(),
    adminCtrl.viewAllRides
);

router.patch(
    '/rides/:id',
    auth.verifyToken,
    auth.requireAdmin,
    body('action').isIn(['Approved','Rejected']),
    adminCtrl.approveRejectRide
);

router.get('/analytics', auth.verifyToken, auth.requireAdmin, adminCtrl.getAnalytics);
  
module.exports = router;