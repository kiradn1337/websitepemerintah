const CryptoJS = require('crypto-js');
const path = require('path');
const fs = require('fs');

module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    accessLevel: {
      type: DataTypes.ENUM('public', 'admin', 'superadmin'),
      defaultValue: 'admin'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    hooks: {
      afterCreate: async (file) => {
        if (file.isEncrypted) {
          try {
            const filePath = file.filePath;
            const encryptionKey = process.env.ENCRYPTION_KEY;
            
            // Read the file
            const fileContent = fs.readFileSync(filePath);
            
            // Encrypt the file content
            const encryptedData = CryptoJS.AES.encrypt(fileContent.toString('binary'), encryptionKey).toString();
            
            // Write the encrypted content back to the file
            fs.writeFileSync(filePath, encryptedData);
          } catch (error) {
            console.error('File encryption error:', error);
          }
        }
      },
      beforeDestroy: async (file) => {
        try {
          if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
          }
        } catch (error) {
          console.error('File deletion error:', error);
        }
      }
    }
  });

  // Instance method to decrypt file
  File.prototype.decryptFile = async function() {
    if (!this.isEncrypted) return this.filePath;
    
    try {
      const encryptedData = fs.readFileSync(this.filePath, 'utf8');
      const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Latin1);
      
      const tempDir = path.join(__dirname, '../../uploads/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `dec_${this.fileName}`);
      fs.writeFileSync(tempFilePath, Buffer.from(decrypted, 'binary'));
      
      return tempFilePath;
    } catch (error) {
      console.error('File decryption error:', error);
      throw new Error('Failed to decrypt file');
    }
  };

  return File;
};
