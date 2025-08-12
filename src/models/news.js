module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define('News', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    publishDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Umum'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: (news) => {
        if (!news.slug) {
          news.slug = news.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        }
        
        if (!news.summary && news.content) {
          // Create a summary from the first 150 characters of content
          news.summary = news.content
            .replace(/(<([^>]+)>)/gi, '') // Remove HTML tags
            .substring(0, 150) + '...';
        }
      },
      beforeUpdate: (news) => {
        if (news.changed('title')) {
          news.slug = news.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        }
        
        if (news.changed('content') && !news.summary) {
          // Update summary if content changed
          news.summary = news.content
            .replace(/(<([^>]+)>)/gi, '') // Remove HTML tags
            .substring(0, 150) + '...';
        }
      }
    }
  });

  return News;
};
