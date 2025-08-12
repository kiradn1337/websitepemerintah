const { News } = require('../models');

// Get home page
const getHomePage = async (req, res) => {
  try {
    // Get featured news for slider
    const featuredNews = await News.findAll({
      where: {
        status: 'published',
        featured: true
      },
      order: [['publishDate', 'DESC']],
      limit: 5
    });
    
    // Get latest news
    const latestNews = await News.findAll({
      where: {
        status: 'published'
      },
      order: [['publishDate', 'DESC']],
      limit: 6
    });
    
    res.render('home', {
      title: 'Selamat Datang di Portal Pemerintahan',
      featuredNews,
      latestNews
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('home', {
      title: 'Selamat Datang di Portal Pemerintahan',
      featuredNews: [],
      latestNews: []
    });
  }
};

// Get about page
const getAboutPage = (req, res) => {
  res.render('about', {
    title: 'Tentang Kami'
  });
};

// Get contact page
const getContactPage = (req, res) => {
  res.render('contact', {
    title: 'Kontak'
  });
};

module.exports = {
  getHomePage,
  getAboutPage,
  getContactPage
};
