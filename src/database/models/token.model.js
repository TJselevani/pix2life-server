const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');
const User = require('./user.model');

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
  timestamps: true,
});

User.hasOne(AuthJWTToken, { foreignKey: 'uid', as: 'authJwtToken', onDelete: 'CASCADE', });
AuthJWTToken.belongsTo(User, { foreignKey: 'uid' });

module.exports = AuthJWTToken;
