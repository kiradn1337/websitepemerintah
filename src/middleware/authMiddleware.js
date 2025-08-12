const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error_msg', 'Silakan login terlebih dahulu.');
    return res.redirect('/auth/login');
  }
  next();
};

// Check if user is admin or superadmin
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error_msg', 'Silakan login terlebih dahulu.');
    return res.redirect('/auth/login');
  }
  
  if (!['admin', 'superadmin'].includes(req.session.role)) {
    req.flash('error_msg', 'Anda tidak memiliki akses ke halaman ini.');
    return res.redirect('/dashboard');
  }
  
  next();
};

// Check if user is superadmin
const requireSuperAdmin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error_msg', 'Silakan login terlebih dahulu.');
    return res.redirect('/auth/login');
  }
  
  if (req.session.role !== 'superadmin') {
    req.flash('error_msg', 'Anda tidak memiliki akses ke halaman ini.');
    return res.redirect('/dashboard');
  }
  
  next();
};

// Check current user for all routes
const checkUser = async (req, res, next) => {
  res.locals.user = null;
  
  if (req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (user) {
        res.locals.user = user.toJSON();
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  }
  
  next();
};

module.exports = { requireAuth, requireAdmin, requireSuperAdmin, checkUser };
