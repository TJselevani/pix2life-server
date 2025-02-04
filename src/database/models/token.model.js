const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

const AuthJWTToken = sequelize.define('AuthJWTToken', {
  uid: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  // tableName: 'authJWTTokens',
  timestamps: true,
});

module.exports = AuthJWTToken;
