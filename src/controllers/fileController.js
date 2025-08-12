const { File, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { uploadDirs } = require('../middleware/uploadMiddleware');

// Get all files (with filtering) - For admin/superadmin
const getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    const where = {};
    
    // Add search condition
    if (search) {
      where[Op.or] = [
        { originalName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search] } }
      ];
    }
    
    // Filter by category
    if (req.query.category) {
      where.category = req.query.category;
    }
    
    // Filter by access level
    if (req.query.accessLevel) {
      where.accessLevel = req.query.accessLevel;
    }
    
    // Admin can only see public and admin files
    if (req.session.role === 'admin') {
      where.accessLevel = { [Op.in]: ['public', 'admin'] };
    }
    
    // Add file type filter
    if (req.query.fileType) {
      where.fileType = { [Op.iLike]: `%${req.query.fileType}%` };
    }
    
    const { count, rows: files } = await File.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'uploader',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });
    
    const totalPages = Math.ceil(count / limit);
    
    // Get all available categories for filter dropdown
    const categories = await File.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: {
        category: {
          [Op.ne]: null
        }
      },
      raw: true
    });
    
    // Get all available file types for filter dropdown
    const fileTypes = await File.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('fileType')), 'fileType']],
      raw: true
    });
    
    // Determine the current view template based on user role
    let viewTemplate;
    if (req.session.role === 'superadmin') {
      viewTemplate = 'superadmin/files/index';
    } else {
      viewTemplate = 'admin/files/index';
    }
    
    res.render(viewTemplate, {
      title: 'Manajemen File',
      files,
      currentPage: page,
      totalPages,
      totalFiles: count,
      search,
      category: req.query.category || '',
      accessLevel: req.query.accessLevel || '',
      fileType: req.query.fileType || '',
      categories: categories.map(c => c.category),
      fileTypes: fileTypes.map(ft => ft.fileType)
    });
  } catch (error) {
    console.error('Get files error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data file');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin');
    } else {
      return res.redirect('/admin');
    }
  }
};

// Show upload file form
const showUploadFileForm = (req, res) => {
  // Determine the view template based on user role
  let viewTemplate;
  if (req.session.role === 'superadmin') {
    viewTemplate = 'superadmin/files/upload';
  } else {
    viewTemplate = 'admin/files/upload';
  }
  
  res.render(viewTemplate, {
    title: 'Upload File Baru'
  });
};

// Upload new file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error_msg', 'File tidak ditemukan');
      return res.redirect('back');
    }
    
    const {
      description,
      category,
      tags,
      accessLevel,
      isEncrypted
    } = req.body;
    
    // Create file record in database
    await File.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      accessLevel: accessLevel || 'admin',
      isEncrypted: isEncrypted === 'true',
      uploadedBy: req.session.userId
    });
    
    req.flash('success_msg', 'File berhasil diupload');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/files');
    } else {
      return res.redirect('/admin/files');
    }
  } catch (error) {
    console.error('Upload file error:', error);
    
    // Remove uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    req.flash('error_msg', 'Terjadi kesalahan saat mengupload file');
    return res.redirect('back');
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    
    if (!file) {
      req.flash('error_msg', 'File tidak ditemukan');
      return res.redirect('back');
    }
    
    // Check access permission
    if (file.accessLevel === 'superadmin' && req.session.role !== 'superadmin') {
      req.flash('error_msg', 'Anda tidak memiliki akses untuk mengunduh file ini');
      return res.redirect('back');
    }
    
    if (file.accessLevel === 'admin' && !['admin', 'superadmin'].includes(req.session.role)) {
      req.flash('error_msg', 'Anda tidak memiliki akses untuk mengunduh file ini');
      return res.redirect('back');
    }
    
    let filePath;
    
    // If file is encrypted, decrypt it first
    if (file.isEncrypted) {
      try {
        filePath = await file.decryptFile();
      } catch (error) {
        req.flash('error_msg', 'Gagal mendekripsi file');
        return res.redirect('back');
      }
    } else {
      filePath = file.filePath;
    }
    
    // Update download count
    await file.update({ downloadCount: file.downloadCount + 1 });
    
    // Send file for download
    res.download(filePath, file.originalName, (err) => {
      if (err) {
        console.error('Download error:', err);
        req.flash('error_msg', 'Terjadi kesalahan saat mengunduh file');
        return res.redirect('back');
      }
      
      // Clean up temp decrypted file after download
      if (file.isEncrypted && filePath.includes('/temp/')) {
        setTimeout(() => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.error('Error deleting temp file:', error);
          }
        }, 1000);
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengunduh file');
    return res.redirect('back');
  }
};

// Show edit file form
const showEditFileForm = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    
    if (!file) {
      req.flash('error_msg', 'File tidak ditemukan');
      
      // Redirect based on user role
      if (req.session.role === 'superadmin') {
        return res.redirect('/superadmin/files');
      } else {
        return res.redirect('/admin/files');
      }
    }
    
    // Check if admin has permission to edit superadmin files
    if (req.session.role === 'admin' && file.accessLevel === 'superadmin') {
      req.flash('error_msg', 'Anda tidak memiliki akses untuk mengedit file ini');
      return res.redirect('/admin/files');
    }
    
    // Determine the view template based on user role
    let viewTemplate;
    if (req.session.role === 'superadmin') {
      viewTemplate = 'superadmin/files/edit';
    } else {
      viewTemplate = 'admin/files/edit';
    }
    
    res.render(viewTemplate, {
      title: 'Edit File',
      file
    });
  } catch (error) {
    console.error('Show edit file error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data file');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/files');
    } else {
      return res.redirect('/admin/files');
    }
  }
};

// Update file
const updateFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    
    if (!file) {
      req.flash('error_msg', 'File tidak ditemukan');
      
      // Redirect based on user role
      if (req.session.role === 'superadmin') {
        return res.redirect('/superadmin/files');
      } else {
        return res.redirect('/admin/files');
      }
    }
    
    // Check if admin has permission to edit superadmin files
    if (req.session.role === 'admin' && file.accessLevel === 'superadmin') {
      req.flash('error_msg', 'Anda tidak memiliki akses untuk mengedit file ini');
      return res.redirect('/admin/files');
    }
    
    const {
      description,
      category,
      tags,
      accessLevel
    } = req.body;
    
    // Update file record
    await file.update({
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      accessLevel: req.session.role === 'superadmin' ? (accessLevel || 'admin') : file.accessLevel
    });
    
    req.flash('success_msg', 'File berhasil diperbarui');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/files');
    } else {
      return res.redirect('/admin/files');
    }
  } catch (error) {
    console.error('Update file error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat memperbarui file');
    return res.redirect('back');
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    
    if (!file) {
      req.flash('error_msg', 'File tidak ditemukan');
      
      // Redirect based on user role
      if (req.session.role === 'superadmin') {
        return res.redirect('/superadmin/files');
      } else {
        return res.redirect('/admin/files');
      }
    }
    
    // Check if admin has permission to delete superadmin files
    if (req.session.role === 'admin' && file.accessLevel === 'superadmin') {
      req.flash('error_msg', 'Anda tidak memiliki akses untuk menghapus file ini');
      return res.redirect('/admin/files');
    }
    
    // Delete file from storage
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }
    
    // Delete record from database
    await file.destroy();
    
    req.flash('success_msg', 'File berhasil dihapus');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/files');
    } else {
      return res.redirect('/admin/files');
    }
  } catch (error) {
    console.error('Delete file error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat menghapus file');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/files');
    } else {
      return res.redirect('/admin/files');
    }
  }
};

module.exports = {
  getAllFiles,
  showUploadFileForm,
  uploadFile,
  downloadFile,
  showEditFileForm,
  updateFile,
  deleteFile
};
