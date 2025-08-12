const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');
const { requireAuth, requireAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');

// Route untuk sitemap pengguna biasa
router.get('/sitemap', requireAuth, sitemapController.getUserSitemap);

// Route untuk sitemap admin
router.get('/admin/sitemap', requireAuth, requireAdmin, sitemapController.getAdminSitemap);

// Route untuk sitemap superadmin
router.get('/superadmin/sitemap', requireAuth, requireSuperAdmin, sitemapController.getSuperadminSitemap);

module.exports = router;
