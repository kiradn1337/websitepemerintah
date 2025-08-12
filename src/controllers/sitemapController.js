// Controller untuk sitemap halaman

// Sitemap untuk pengguna biasa
const getUserSitemap = (req, res) => {
  res.render('dashboard/sitemap', {
    title: 'Sitemap Pengguna'
  });
};

// Sitemap untuk admin
const getAdminSitemap = (req, res) => {
  res.render('admin/sitemap', {
    title: 'Sitemap Admin'
  });
};

// Sitemap untuk superadmin
const getSuperadminSitemap = (req, res) => {
  res.render('superadmin/sitemap', {
    title: 'Sitemap Super Admin'
  });
};

module.exports = {
  getUserSitemap,
  getAdminSitemap,
  getSuperadminSitemap
};
