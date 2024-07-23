const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');
const User = require('./user.model');

const Audio = sequelize.define('Audio', {
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
}, {
  timestamps: true,
});

User.hasMany(Audio, { foreignKey: 'ownerId', as: 'Audios', onDelete: 'CASCADE', });
Audio.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = Audio;
