const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Get all users (for superadmin)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    const where = {
      [Op.or]: [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } }
      ]
    };
    
    if (req.query.role) {
      where.role = req.query.role;
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('superadmin/users/index', {
      title: 'Manajemen Pengguna',
      users,
      currentPage: page,
      totalPages,
      totalUsers: count,
      search,
      role: req.query.role || ''
    });
  } catch (error) {
    console.error('Get users error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data pengguna');
    res.redirect('/superadmin');
  }
};

// Show create user form
const showCreateUserForm = (req, res) => {
  res.render('superadmin/users/create', {
    title: 'Tambah Pengguna Baru'
  });
};

// Create new user
const createUser = async (req, res) => {
  const { username, email, password, fullName, role } = req.body;
  
  try {
    // Check if username exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      req.flash('error_msg', 'Username sudah digunakan');
      return res.redirect('/superadmin/users/create');
    }
    
    // Check if email exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      req.flash('error_msg', 'Email sudah digunakan');
      return res.redirect('/superadmin/users/create');
    }
    
    // Create user
    await User.create({
      username,
      email,
      password,
      fullName,
      role: role || 'user'
    });
    
    req.flash('success_msg', 'Pengguna berhasil ditambahkan');
    res.redirect('/superadmin/users');
  } catch (error) {
    console.error('Create user error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat membuat pengguna baru');
    res.redirect('/superadmin/users/create');
  }
};

// Show edit user form
const showEditUserForm = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      req.flash('error_msg', 'Pengguna tidak ditemukan');
      return res.redirect('/superadmin/users');
    }
    
    res.render('superadmin/users/edit', {
      title: 'Edit Pengguna',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Show edit user error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data pengguna');
    res.redirect('/superadmin/users');
  }
};

// Update user
const updateUser = async (req, res) => {
  const { fullName, email, role, isActive } = req.body;
  
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Pengguna tidak ditemukan');
      return res.redirect('/superadmin/users');
    }
    
    // If email is changed, check if it already exists
    if (email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        req.flash('error_msg', 'Email sudah digunakan');
        return res.redirect(`/superadmin/users/edit/${req.params.id}`);
      }
    }
    
    // Update user
    const updateData = {
      fullName,
      email,
      role,
      isActive: isActive === 'true'
    };
    
    // If password is provided, update it
    if (req.body.password) {
      updateData.password = req.body.password;
    }
    
    await user.update(updateData);
    
    req.flash('success_msg', 'Pengguna berhasil diperbarui');
    res.redirect('/superadmin/users');
  } catch (error) {
    console.error('Update user error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat memperbarui pengguna');
    res.redirect(`/superadmin/users/edit/${req.params.id}`);
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Pengguna tidak ditemukan');
      return res.redirect('/superadmin/users');
    }
    
    // Prevent deleting yourself
    if (user.id === req.session.userId) {
      req.flash('error_msg', 'Anda tidak dapat menghapus akun Anda sendiri');
      return res.redirect('/superadmin/users');
    }
    
    await user.destroy();
    
    req.flash('success_msg', 'Pengguna berhasil dihapus');
    res.redirect('/superadmin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat menghapus pengguna');
    res.redirect('/superadmin/users');
  }
};

// Change own password (for all users)
const showChangePasswordForm = (req, res) => {
  res.render('users/change-password', {
    title: 'Ubah Password'
  });
};

// Update own password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  try {
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'Password baru tidak sama');
      return res.redirect('/users/change-password');
    }
    
    const user = await User.findByPk(req.session.userId);
    
    if (!user) {
      req.flash('error_msg', 'Pengguna tidak ditemukan');
      return res.redirect('/users/change-password');
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Password saat ini salah');
      return res.redirect('/users/change-password');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    req.flash('success_msg', 'Password berhasil diubah');
    
    // Redirect based on role
    if (user.role === 'superadmin') {
      return res.redirect('/superadmin');
    } else if (user.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Update password error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengubah password');
    res.redirect('/users/change-password');
  }
};

module.exports = {
  getAllUsers,
  showCreateUserForm,
  createUser,
  showEditUserForm,
  updateUser,
  deleteUser,
  showChangePasswordForm,
  updatePassword
};
