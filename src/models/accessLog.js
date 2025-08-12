module.exports = (sequelize, DataTypes) => {
  const AccessLog = sequelize.define('AccessLog', {
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
    action: {
      type: DataTypes.STRING, // VIEW, CREATE, UPDATE, DELETE, DOWNLOAD, DECRYPT, etc.
      allowNull: false
    },
    resource: {
      type: DataTypes.STRING, // PersonalData, File, News, etc.
      allowNull: false
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  AccessLog.associate = function(models) {
    AccessLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return AccessLog;
};
