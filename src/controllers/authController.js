const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Show login form
const getLogin = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Login', layout: 'layouts/auth' });
};

// Handle login
const postLogin = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user
    const user = await User.findOne({
      where: { 
        username,
        isActive: true
      }
    });
    
    if (!user) {
      req.flash('error_msg', 'Username atau password salah');
      return res.redirect('/auth/login');
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Username atau password salah');
      return res.redirect('/auth/login');
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;
    
    // Update last login
    await User.update(
      { lastLogin: new Date() },
      { where: { id: user.id } }
    );
    
    req.flash('success_msg', `Selamat datang, ${user.fullName}!`);
    
    // Redirect based on role
    if (user.role === 'superadmin') {
      return res.redirect('/superadmin');
    } else if (user.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat login');
    res.redirect('/auth/login');
  }
};

// Show registration form
const getRegister = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { title: 'Register', layout: 'layouts/auth' });
};

// Handle registration
const postRegister = async (req, res) => {
  const { username, email, password, confirmPassword, fullName } = req.body;
  
  try {
    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Password tidak sama');
      return res.redirect('/auth/register');
    }
    
    // Check if username exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      req.flash('error_msg', 'Username sudah digunakan');
      return res.redirect('/auth/register');
    }
    
    // Check if email exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      req.flash('error_msg', 'Email sudah digunakan');
      return res.redirect('/auth/register');
    }
    
    // Create user
    await User.create({
      username,
      email,
      password,
      fullName,
      role: 'user'
    });
    
    req.flash('success_msg', 'Registrasi berhasil, silakan login');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat registrasi');
    res.redirect('/auth/register');
  }
};

// Handle logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/dashboard');
    }
    res.redirect('/auth/login');
  });
};

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout
};
