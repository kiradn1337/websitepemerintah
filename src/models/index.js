const { Sequelize } = require('sequelize');
const config = require('../config/database');

let sequelize;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = config[env];
  
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging
    }
  );
}

const db = {
  sequelize,
  Sequelize,
  User: require('./user')(sequelize, Sequelize),
  PersonalData: require('./personalData')(sequelize, Sequelize),
  File: require('./file')(sequelize, Sequelize),
  News: require('./news')(sequelize, Sequelize),
};

// Define associations
db.User.hasMany(db.PersonalData, { foreignKey: 'userId', as: 'personalData' });
db.PersonalData.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.User.hasMany(db.File, { foreignKey: 'uploadedBy', as: 'files' });
db.File.belongsTo(db.User, { foreignKey: 'uploadedBy', as: 'uploader' });

db.User.hasMany(db.News, { foreignKey: 'authorId', as: 'news' });
db.News.belongsTo(db.User, { foreignKey: 'authorId', as: 'author' });

module.exports = db;
