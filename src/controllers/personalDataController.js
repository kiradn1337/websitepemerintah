const { PersonalData } = require('../models');
const { Op } = require('sequelize');
const { encryptData, decryptData } = require('../utils/encryption');

// Get all personal data for current user
const getUserPersonalData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    const where = {
      userId: req.session.userId
    };
    
    // Add search condition
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search] } }
      ];
    }
    
    // Filter by data type
    if (req.query.dataType) {
      where.dataType = req.query.dataType;
    }
    
    const { count, rows: personalData } = await PersonalData.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('dashboard/personal-data/index', {
      title: 'Data Pribadi',
      personalData,
      currentPage: page,
      totalPages,
      totalData: count,
      search,
      dataType: req.query.dataType || ''
    });
  } catch (error) {
    console.error('Get personal data error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data pribadi');
    res.redirect('/dashboard');
  }
};

// Show create personal data form
const showCreatePersonalDataForm = (req, res) => {
  res.render('dashboard/personal-data/create', {
    title: 'Tambah Data Pribadi'
  });
};

// Create new personal data
const createPersonalData = async (req, res) => {
  try {
    const {
      title,
      description,
      data,
      dataType,
      tags,
      isPublic
    } = req.body;
    
    await PersonalData.create({
      userId: req.session.userId,
      title,
      description,
      data, // This will be automatically encrypted by the model
      dataType: dataType || 'personal',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic === 'true'
    });
    
    req.flash('success_msg', 'Data pribadi berhasil ditambahkan');
    res.redirect('/dashboard/personal-data');
  } catch (error) {
    console.error('Create personal data error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat membuat data pribadi');
    res.redirect('back');
  }
};

// Show edit personal data form
const showEditPersonalDataForm = async (req, res) => {
  try {
    const personalData = await PersonalData.findOne({
      where: {
        id: req.params.id,
        userId: req.session.userId
      }
    });
    
    if (!personalData) {
      req.flash('error_msg', 'Data pribadi tidak ditemukan');
      return res.redirect('/dashboard/personal-data');
    }
    
    res.render('dashboard/personal-data/edit', {
      title: 'Edit Data Pribadi',
      personalData
    });
  } catch (error) {
    console.error('Show edit personal data error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data pribadi');
    res.redirect('/dashboard/personal-data');
  }
};

// Update personal data
const updatePersonalData = async (req, res) => {
  try {
    const personalData = await PersonalData.findOne({
      where: {
        id: req.params.id,
        userId: req.session.userId
      }
    });
    
    if (!personalData) {
      req.flash('error_msg', 'Data pribadi tidak ditemukan');
      return res.redirect('/dashboard/personal-data');
    }
    
    const {
      title,
      description,
      data,
      dataType,
      tags,
      isPublic
    } = req.body;
    
    // Update data
    await personalData.update({
      title,
      description,
      data: data || personalData.data, // If data is provided, it will be re-encrypted
      dataType: dataType || 'personal',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic === 'true'
    });
    
    req.flash('success_msg', 'Data pribadi berhasil diperbarui');
    res.redirect('/dashboard/personal-data');
  } catch (error) {
    console.error('Update personal data error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat memperbarui data pribadi');
    res.redirect('back');
  }
};

// View personal data details
const viewPersonalData = async (req, res) => {
  try {
    const personalData = await PersonalData.findOne({
      where: {
        id: req.params.id,
        userId: req.session.userId
      }
    });
    
    if (!personalData) {
      req.flash('error_msg', 'Data pribadi tidak ditemukan');
      return res.redirect('/dashboard/personal-data');
    }
    
    res.render('dashboard/personal-data/view', {
      title: 'Detail Data Pribadi',
      personalData
    });
  } catch (error) {
    console.error('View personal data error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil detail data pribadi');
    res.redirect('/dashboard/personal-data');
  }
};

// Delete personal data
const deletePersonalData = async (req, res) => {
  try {
    const personalData = await PersonalData.findOne({
      where: {
        id: req.params.id,
        userId: req.session.userId
      }
    });
    
    if (!personalData) {
      req.flash('error_msg', 'Data pribadi tidak ditemukan');
      return res.redirect('/dashboard/personal-data');
    }
    
    await personalData.destroy();
    
    req.flash('success_msg', 'Data pribadi berhasil dihapus');
    res.redirect('/dashboard/personal-data');
  } catch (error) {
    console.error('Delete personal data error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat menghapus data pribadi');
    res.redirect('/dashboard/personal-data');
  }
};

module.exports = {
  getUserPersonalData,
  showCreatePersonalDataForm,
  createPersonalData,
  showEditPersonalDataForm,
  updatePersonalData,
  viewPersonalData,
  deletePersonalData
};
