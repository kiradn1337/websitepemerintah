const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validationMiddleware');

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', [
  body('username').notEmpty().withMessage('Username harus diisi'),
  body('password').notEmpty().withMessage('Password harus diisi')
], validate, authController.postLogin);

// Registration routes
router.get('/register', authController.getRegister);
router.post('/register', [
  body('username')
    .notEmpty().withMessage('Username harus diisi')
    .isLength({ min: 3, max: 30 }).withMessage('Username harus 3-30 karakter'),
  body('email')
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('password')
    .notEmpty().withMessage('Password harus diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('confirmPassword')
    .notEmpty().withMessage('Konfirmasi password harus diisi')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password tidak sama');
      }
      return true;
    }),
  body('fullName').notEmpty().withMessage('Nama lengkap harus diisi')
], validate, authController.postRegister);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;
