const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');
const User = require('./user.model');

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
  // features: {
  //   type: DataTypes.JSON,
  //   defaultValue: {},
  //   allowNull: true,
  // },
}, {
  timestamps: true,
});

User.hasMany(Image, { foreignKey: 'ownerId', as: 'images', onDelete: 'CASCADE', });
Image.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = Image;
