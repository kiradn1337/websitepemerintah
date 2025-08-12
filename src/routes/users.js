const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// Change password
router.get('/change-password', requireAuth, userController.showChangePasswordForm);
router.post('/change-password', requireAuth, [
  body('currentPassword').notEmpty().withMessage('Password saat ini harus diisi'),
  body('newPassword')
    .notEmpty().withMessage('Password baru harus diisi')
    .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  body('confirmPassword')
    .notEmpty().withMessage('Konfirmasi password harus diisi')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password tidak sama');
      }
      return true;
    })
], validate, userController.updatePassword);

module.exports = router;
