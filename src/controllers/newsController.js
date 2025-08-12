const { News, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Get all news (public view)
const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    const where = {
      status: 'published'
    };
    
    // Add search condition
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search] } }
      ];
    }
    
    // Filter by category
    if (req.query.category) {
      where.category = req.query.category;
    }
    
    const { count, rows: news } = await News.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'author',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [
        ['featured', 'DESC'],
        ['publishDate', 'DESC']
      ],
      offset,
      limit
    });
    
    const totalPages = Math.ceil(count / limit);
    
    // Get featured news for the top slider
    const featuredNews = await News.findAll({
      where: {
        status: 'published',
        featured: true
      },
      include: [
        { 
          model: User, 
          as: 'author',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['publishDate', 'DESC']],
      limit: 5
    });
    
    // Get all available categories for sidebar
    const categories = await News.findAll({
      attributes: [
        'category', 
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        status: 'published',
        category: {
          [Op.ne]: null
        }
      },
      group: ['category'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true
    });
    
    // Get recent news for sidebar
    const recentNews = await News.findAll({
      where: {
        status: 'published'
      },
      attributes: ['id', 'title', 'slug', 'publishDate', 'coverImage'],
      order: [['publishDate', 'DESC']],
      limit: 5
    });
    
    res.render('news/index', {
      title: 'Berita Pemerintahan',
      news,
      featuredNews,
      categories,
      recentNews,
      currentPage: page,
      totalPages,
      totalNews: count,
      search,
      category: req.query.category || ''
    });
  } catch (error) {
    console.error('Get news error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data berita');
    res.redirect('/');
  }
};

// Get single news by slug (public view)
const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({
      where: {
        slug: req.params.slug,
        status: 'published'
      },
      include: [
        { 
          model: User, 
          as: 'author',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });
    
    if (!news) {
      req.flash('error_msg', 'Berita tidak ditemukan');
      return res.redirect('/news');
    }
    
    // Increment view count
    await news.update({ viewCount: news.viewCount + 1 });
    
    // Get related news with same category
    const relatedNews = await News.findAll({
      where: {
        category: news.category,
        status: 'published',
        id: { [Op.ne]: news.id }
      },
      attributes: ['id', 'title', 'slug', 'publishDate', 'coverImage', 'summary'],
      order: [['publishDate', 'DESC']],
      limit: 3
    });
    
    // Get all available categories for sidebar
    const categories = await News.findAll({
      attributes: [
        'category', 
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        status: 'published',
        category: {
          [Op.ne]: null
        }
      },
      group: ['category'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true
    });
    
    // Get recent news for sidebar
    const recentNews = await News.findAll({
      where: {
        status: 'published',
        id: { [Op.ne]: news.id }
      },
      attributes: ['id', 'title', 'slug', 'publishDate', 'coverImage'],
      order: [['publishDate', 'DESC']],
      limit: 5
    });
    
    res.render('news/detail', {
      title: news.title,
      news,
      relatedNews,
      categories,
      recentNews
    });
  } catch (error) {
    console.error('Get news detail error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil detail berita');
    res.redirect('/news');
  }
};

// Get all news (admin/superadmin view)
const getAdminNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    const where = {};
    
    // Add search condition
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search] } }
      ];
    }
    
    // Filter by category
    if (req.query.category) {
      where.category = req.query.category;
    }
    
    // Filter by status
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    const { count, rows: news } = await News.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'author',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });
    
    const totalPages = Math.ceil(count / limit);
    
    // Get all available categories for filter dropdown
    const categories = await News.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: {
        category: {
          [Op.ne]: null
        }
      },
      raw: true
    });
    
    // Determine view template based on user role
    let viewTemplate;
    if (req.session.role === 'superadmin') {
      viewTemplate = 'superadmin/news/index';
    } else {
      viewTemplate = 'admin/news/index';
    }
    
    res.render(viewTemplate, {
      title: 'Manajemen Berita',
      news,
      currentPage: page,
      totalPages,
      totalNews: count,
      search,
      category: req.query.category || '',
      status: req.query.status || '',
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Get admin news error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data berita');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin');
    } else {
      return res.redirect('/admin');
    }
  }
};

// Show create news form
const showCreateNewsForm = (req, res) => {
  // Determine view template based on user role
  let viewTemplate;
  if (req.session.role === 'superadmin') {
    viewTemplate = 'superadmin/news/create';
  } else {
    viewTemplate = 'admin/news/create';
  }
  
  res.render(viewTemplate, {
    title: 'Buat Berita Baru'
  });
};

// Create new news
const createNews = async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      tags,
      featured,
      status
    } = req.body;
    
    // Process slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Check if slug already exists
    const existingSlug = await News.findOne({ where: { slug } });
    if (existingSlug) {
      // Append timestamp to make slug unique
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }
    
    // Create news data
    const newsData = {
      title,
      slug,
      content,
      summary: summary || null,
      category: category || 'Umum',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featured: featured === 'true',
      status: status || 'published',
      authorId: req.session.userId
    };
    
    // If cover image is uploaded
    if (req.file) {
      newsData.coverImage = `/uploads/news/${req.file.filename}`;
    }
    
    // Create news record
    await News.create(newsData);
    
    req.flash('success_msg', 'Berita berhasil dibuat');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/news');
    } else {
      return res.redirect('/admin/news');
    }
  } catch (error) {
    console.error('Create news error:', error);
    
    // Remove uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    req.flash('error_msg', 'Terjadi kesalahan saat membuat berita');
    return res.redirect('back');
  }
};

// Show edit news form
const showEditNewsForm = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      req.flash('error_msg', 'Berita tidak ditemukan');
      
      // Redirect based on user role
      if (req.session.role === 'superadmin') {
        return res.redirect('/superadmin/news');
      } else {
        return res.redirect('/admin/news');
      }
    }
    
    // Determine view template based on user role
    let viewTemplate;
    if (req.session.role === 'superadmin') {
      viewTemplate = 'superadmin/news/edit';
    } else {
      viewTemplate = 'admin/news/edit';
    }
    
    res.render(viewTemplate, {
      title: 'Edit Berita',
      news
    });
  } catch (error) {
    console.error('Show edit news error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat mengambil data berita');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/news');
    } else {
      return res.redirect('/admin/news');
    }
  }
};

// Update news
const updateNews = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      req.flash('error_msg', 'Berita tidak ditemukan');
      
      // Redirect based on user role
      if (req.session.role === 'superadmin') {
        return res.redirect('/superadmin/news');
      } else {
        return res.redirect('/admin/news');
      }
    }
    
    const {
      title,
      content,
      summary,
      category,
      tags,
      featured,
      status
    } = req.body;
    
    let slug = news.slug;
    
    // If title changed, update slug
    if (title !== news.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      // Check if new slug already exists
      const existingSlug = await News.findOne({ 
        where: { 
          slug,
          id: { [Op.ne]: news.id }
        }
      });
      
      if (existingSlug) {
        // Append timestamp to make slug unique
        slug = `${slug}-${Date.now().toString().slice(-6)}`;
      }
    }
    
    // Update news data
    const newsData = {
      title,
      slug,
      content,
      summary: summary || null,
      category: category || 'Umum',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featured: featured === 'true',
      status: status || 'published'
    };
    
    // If new cover image is uploaded
    if (req.file) {
      // Delete old cover image if exists
      if (news.coverImage && fs.existsSync(path.join(__dirname, '../../public', news.coverImage))) {
        fs.unlinkSync(path.join(__dirname, '../../public', news.coverImage));
      }
      
      newsData.coverImage = `/uploads/news/${req.file.filename}`;
    }
    
    // Update news record
    await news.update(newsData);
    
    req.flash('success_msg', 'Berita berhasil diperbarui');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/news');
    } else {
      return res.redirect('/admin/news');
    }
  } catch (error) {
    console.error('Update news error:', error);
    
    // Remove uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    req.flash('error_msg', 'Terjadi kesalahan saat memperbarui berita');
    return res.redirect('back');
  }
};

// Delete news
const deleteNews = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      req.flash('error_msg', 'Berita tidak ditemukan');
      
      // Redirect based on user role
      if (req.session.role === 'superadmin') {
        return res.redirect('/superadmin/news');
      } else {
        return res.redirect('/admin/news');
      }
    }
    
    // Delete cover image if exists
    if (news.coverImage && fs.existsSync(path.join(__dirname, '../../public', news.coverImage))) {
      fs.unlinkSync(path.join(__dirname, '../../public', news.coverImage));
    }
    
    // Delete news record
    await news.destroy();
    
    req.flash('success_msg', 'Berita berhasil dihapus');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/news');
    } else {
      return res.redirect('/admin/news');
    }
  } catch (error) {
    console.error('Delete news error:', error);
    req.flash('error_msg', 'Terjadi kesalahan saat menghapus berita');
    
    // Redirect based on user role
    if (req.session.role === 'superadmin') {
      return res.redirect('/superadmin/news');
    } else {
      return res.redirect('/admin/news');
    }
  }
};

module.exports = {
  getAllNews,
  getNewsBySlug,
  getAdminNews,
  showCreateNewsForm,
  createNews,
  showEditNewsForm,
  updateNews,
  deleteNews
};
