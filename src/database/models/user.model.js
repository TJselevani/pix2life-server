const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscriptionPlan: {
    type: DataTypes.ENUM,
    values: ['Regular', 'Premium', 'PIX2LIFE'],
    allowNull: false,
    defaultValue: 'Regular',
  },
  resetCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetCodeExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  defaultScope: {
    // Exclude resetCode and resetCodeExpires by default
    attributes: { exclude: ['resetCode', 'resetCodeExpires'] }
  },
  scopes: {
    // Create a scope to include resetCode and resetCodeExpires when required
    withResetCode: {
      attributes: { include: ['resetCode', 'resetCodeExpires'] }
    }
  }
});

// const usersWithResetCode = await User.scope('withResetCode').findAll();

module.exports = User;
