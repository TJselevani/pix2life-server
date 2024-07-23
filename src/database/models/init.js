const User = require('./user.model');
const Password = require('./password.model');
const Image = require('./image.model');
const AuthJWTToken = require('./token.model');

// Define associations
User.hasOne(Password, { foreignKey: 'uid' });
Password.belongsTo(User, { foreignKey: 'uid' });

User.hasOne(AuthJWTToken, { foreignKey: 'uid' });
AuthJWTToken.belongsTo(User, { foreignKey: 'uid' });

User.hasMany(Image, { foreignKey: 'ownerId' });
Image.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = {
  User,
  Password,
  Image,
  AuthJWTToken,
};
