const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const { body } = require('express-validator');

router.post(
    '/register',
    [
        body('firstName', 'First name is required').notEmpty().trim(),
        body('lastName', 'Last name is required').notEmpty().trim(),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    authController.register
);

router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password is required').exists()
    ],
    authController.login
);

router.get('/me', auth, authController.me);

module.exports = router;
