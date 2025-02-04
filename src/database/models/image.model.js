const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  galleryName: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },  
  features: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: true,
  defaultScope: {
    // Exclude features and path by default
    attributes: { exclude: ['features'] }
  },
  scopes: {
    // Create a scope to include features when required
    withFeatures: {
      attributes: { include: ['features'] }
    }
  }
});

module.exports = Image;
