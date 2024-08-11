const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

const Video = sequelize.define('Video', {
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
}, {
  timestamps: true,
});

module.exports = Video;
