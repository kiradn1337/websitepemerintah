const { News, File, User, PersonalData } = require('../models');
const { Op } = require('sequelize');

// Get user dashboard
const getUserDashboard = async (req, res) => {
  try {
    // Get latest news
    const latestNews = await News.findAll({
      where: {
        status: 'published'
      },
      order: [['publishDate', 'DESC']],
      limit: 5
    });
    
    // Get personal data count
    const personalDataCount = await PersonalData.count({
      where: {
        userId: req.session.userId
      }
    });
    
    res.render('dashboard/user', {
      title: 'Dashboard',
      latestNews,
      personalDataCount
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat memuat dashboard');
    res.redirect('/');
  }
};

// Get admin dashboard
const getAdminDashboard = async (req, res) => {
  try {
    // Get latest news
    const latestNews = await News.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Get news count
    const newsCount = await News.count();
    
    // Get files count
    const fileCount = await File.count({
      where: {
        accessLevel: {
          [Op.in]: ['public', 'admin']
        }
      }
    });
    
    // Get this month's news count
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthlyNewsCount = await News.count({
      where: {
        createdAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      }
    });
    
    // Get recent files
    const recentFiles = await File.findAll({
      where: {
        accessLevel: {
          [Op.in]: ['public', 'admin']
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      latestNews,
      recentFiles,
      newsCount,
      fileCount,
      monthlyNewsCount
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat memuat dashboard');
    res.redirect('/');
  }
};

// Get superadmin dashboard
const getSuperAdminDashboard = async (req, res) => {
  try {
    // Get latest news
    const latestNews = await News.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Get news count
    const newsCount = await News.count();
    
    // Get files count
    const fileCount = await File.count();
    
    // Get users count
    const userCount = await User.count();
    
    // Get admin count
    const adminCount = await User.count({
      where: {
        role: 'admin'
      }
    });
    
    // Get this month's news count
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthlyNewsCount = await News.count({
      where: {
        createdAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      }
    });
    
    // Get recent files
    const recentFiles = await File.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Get recent users
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: { exclude: ['password'] }
    });
    
    res.render('superadmin/dashboard', {
      title: 'Super Admin Dashboard',
      latestNews,
      recentFiles,
      recentUsers,
      newsCount,
      fileCount,
      userCount,
      adminCount,
      monthlyNewsCount
    });
  } catch (error) {
    console.error('Superadmin dashboard error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat memuat dashboard');
    res.redirect('/');
  }
};

module.exports = {
  getUserDashboard,
  getAdminDashboard,
  getSuperAdminDashboard
};
