const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const userController = require('../controllers/userController');
const personalDataRoutes = require('./personalDataRoutes');
const { requireSuperAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// Superadmin dashboard
router.get('/', requireSuperAdmin, dashboardController.getSuperAdminDashboard);

// User management routes
router.get('/users', requireSuperAdmin, userController.getAllUsers);
router.get('/users/create', requireSuperAdmin, userController.showCreateUserForm);
router.post('/users', requireSuperAdmin, [
  body('username')
    .notEmpty().withMessage('Username harus diisi')
    .isLength({ min: 3, max: 30 }).withMessage('Username harus 3-30 karakter'),
  body('email')
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('password')
    .notEmpty().withMessage('Password harus diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('fullName').notEmpty().withMessage('Nama lengkap harus diisi'),
  body('role').notEmpty().withMessage('Role harus dipilih')
], validate, userController.createUser);

router.get('/users/:id/edit', requireSuperAdmin, userController.showEditUserForm);
router.post('/users/:id', requireSuperAdmin, [
  body('email')
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('fullName').notEmpty().withMessage('Nama lengkap harus diisi'),
  body('role').notEmpty().withMessage('Role harus dipilih')
], validate, userController.updateUser);
router.post('/users/:id/delete', requireSuperAdmin, userController.deleteUser);

// Mount personal data routes under /superadmin/personal-data
router.use('/personal-data', requireSuperAdmin, personalDataRoutes);

module.exports = router;
