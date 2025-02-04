const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

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
  // tableName: 'passwords',
  timestamps: true,
});

module.exports = Password;
