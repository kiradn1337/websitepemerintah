const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const newsController = require('../controllers/newsController');
const fileController = require('../controllers/fileController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { uploadNewsImage, uploadFile } = require('../middleware/uploadMiddleware');

// Admin dashboard
router.get('/', requireAdmin, dashboardController.getAdminDashboard);

// News management routes
router.get('/news', requireAdmin, newsController.getAdminNews);
router.get('/news/create', requireAdmin, newsController.showCreateNewsForm);
router.post('/news', requireAdmin, uploadNewsImage.single('coverImage'), [
  body('title').notEmpty().withMessage('Judul harus diisi'),
  body('content').notEmpty().withMessage('Konten harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi')
], validate, newsController.createNews);

router.get('/news/:id/edit', requireAdmin, newsController.showEditNewsForm);
router.post('/news/:id', requireAdmin, uploadNewsImage.single('coverImage'), [
  body('title').notEmpty().withMessage('Judul harus diisi'),
  body('content').notEmpty().withMessage('Konten harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi')
], validate, newsController.updateNews);
router.post('/news/:id/delete', requireAdmin, newsController.deleteNews);

// File management routes
router.get('/files', requireAdmin, fileController.getAllFiles);
router.get('/files/upload', requireAdmin, fileController.showUploadFileForm);
router.post('/files', requireAdmin, uploadFile.single('file'), [
  body('description').notEmpty().withMessage('Deskripsi harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi')
], validate, fileController.uploadFile);

router.get('/files/:id/edit', requireAdmin, fileController.showEditFileForm);
router.post('/files/:id', requireAdmin, [
  body('description').notEmpty().withMessage('Deskripsi harus diisi'),
  body('category').notEmpty().withMessage('Kategori harus diisi')
], validate, fileController.updateFile);
router.get('/files/:id/download', requireAdmin, fileController.downloadFile);
router.post('/files/:id/delete', requireAdmin, fileController.deleteFile);

module.exports = router;
