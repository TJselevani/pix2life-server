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
  galleryId: {
    type: DataTypes.INTEGER,
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
    defaultValue: {},
    allowNull: true,
  },
}, {
  // tableName: 'images',
  timestamps: true,
});

module.exports = Image;
