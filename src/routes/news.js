const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Get all news
router.get('/', newsController.getAllNews);

// Get single news by slug
router.get('/:slug', newsController.getNewsBySlug);

module.exports = router;
