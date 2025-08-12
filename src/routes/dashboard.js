const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const personalDataController = require('../controllers/personalDataController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// Dashboard route
router.get('/', requireAuth, dashboardController.getUserDashboard);

// Personal data routes
router.get('/personal-data', requireAuth, personalDataController.getUserPersonalData);
router.get('/personal-data/create', requireAuth, personalDataController.showCreatePersonalDataForm);
router.post('/personal-data', requireAuth, [
  body('title').notEmpty().withMessage('Judul harus diisi'),
  body('data').notEmpty().withMessage('Data harus diisi'),
  body('dataType').notEmpty().withMessage('Tipe data harus dipilih')
], validate, personalDataController.createPersonalData);

router.get('/personal-data/:id', requireAuth, personalDataController.viewPersonalData);
router.get('/personal-data/:id/edit', requireAuth, personalDataController.showEditPersonalDataForm);
router.post('/personal-data/:id', requireAuth, [
  body('title').notEmpty().withMessage('Judul harus diisi'),
  body('dataType').notEmpty().withMessage('Tipe data harus dipilih')
], validate, personalDataController.updatePersonalData);
router.post('/personal-data/:id/delete', requireAuth, personalDataController.deletePersonalData);

module.exports = router;
