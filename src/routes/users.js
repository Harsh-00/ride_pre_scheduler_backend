const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const userCtrl = require('../controllers/userController'); 

const router = express.Router();

router.post(
    '/authenticate',
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    userCtrl.authenticateUser
);

router.post(
    '/',
    auth.verifyToken,
    auth.requireAdmin,
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['user','admin']),
    body('employeeId').notEmpty(),
    userCtrl.createUser
);

router.get('/me', auth.verifyToken, userCtrl.getProfile);

router.put(
    '/me',
    auth.verifyToken,
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    userCtrl.updateProfile
);

// Extra Endpoint
router.put(
    '/:id',
    auth.verifyToken,
    auth.requireAdmin,
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['user','admin']),
    body('employeeId').optional().notEmpty(),
    userCtrl.updateUserByAdmin
  );

module.exports = router;