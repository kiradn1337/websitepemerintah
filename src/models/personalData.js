module.exports = (sequelize, DataTypes) => {
  const PersonalData = sequelize.define('PersonalData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dataType: {
      type: DataTypes.ENUM('text', 'file'),
      defaultValue: 'text'
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  PersonalData.associate = function(models) {
    PersonalData.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    PersonalData.hasMany(models.DataVersion, {
      foreignKey: 'dataId',
      as: 'versions'
    });
    
    PersonalData.hasMany(models.AccessLog, {
      foreignKey: 'resourceId',
      constraints: false,
      scope: {
        resource: 'PersonalData'
      },
      as: 'accessLogs'
    });
  };

  return PersonalData;
};
