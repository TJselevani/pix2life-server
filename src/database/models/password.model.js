const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');
const User = require('./user.model');

const Password = sequelize.define('Password', {
  uid: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

User.hasOne(Password, { foreignKey: 'uid', as: 'password', onDelete: 'CASCADE', });
Password.belongsTo(User, { foreignKey: 'uid', as: 'user' });

module.exports = Password;
