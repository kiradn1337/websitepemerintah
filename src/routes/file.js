const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');

// Download file
router.get('/:id/download', requireAuth, fileController.downloadFile);

module.exports = router;
