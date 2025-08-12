module.exports = (sequelize, DataTypes) => {
  const DataVersion = sequelize.define('DataVersion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    dataId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'PersonalData',
        key: 'id'
      }
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  DataVersion.associate = function(models) {
    DataVersion.belongsTo(models.PersonalData, {
      foreignKey: 'dataId',
      as: 'personalData'
    });
    
    DataVersion.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return DataVersion;
};
