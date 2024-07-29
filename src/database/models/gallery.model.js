const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    defaultValue: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  tableName: 'galleries',
  timestamps: true
});

module.exports = Gallery;
