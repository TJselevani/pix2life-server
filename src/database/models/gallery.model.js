const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  timestamps: true
});

module.exports = Gallery;
