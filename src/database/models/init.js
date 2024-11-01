const User = require('./user.model');
const Image = require('./image.model');
const Audio = require('./audio.model');
const Video = require('./video.model');
const Transaction = require('./transaction.model');
const Password = require('./password.model');
const AuthJWTToken = require('./token.model');
const Gallery = require('./gallery.model');

// A User has many Galleries, a Gallery belongs to one User
User.hasMany(Gallery, { foreignKey: 'userId', as: 'galleries'});
Gallery.belongsTo(User, { foreignKey: 'userId' });

// A Gallery can have many Images, an Image belongs to one Gallery
Gallery.hasMany(Image, { foreignKey: 'galleryId', as: 'images'});
Image.belongsTo(Gallery, { foreignKey: 'galleryId' });

// A Gallery can have many Audios, an Audio belongs to one Gallery
Gallery.hasMany(Audio, { foreignKey: 'galleryId', as: 'audios'});
Audio.belongsTo(Gallery, { foreignKey: 'galleryId' });

// A Gallery can have many Videos, a Video belongs to one Gallery
Gallery.hasMany(Video, { foreignKey: 'galleryId', as: 'videos'});
Video.belongsTo(Gallery, { foreignKey: 'galleryId' });

// A User has Many Audios, an Audio belongs to only one User
User.hasMany(Audio, { foreignKey: 'ownerId', as: 'audios', onDelete: 'CASCADE' });
Audio.belongsTo(User, { foreignKey: 'ownerId' });

// A User has Many Images, an Image belongs to only one User
User.hasMany(Image, { foreignKey: 'ownerId', as: 'images', onDelete: 'CASCADE' });
Image.belongsTo(User, { foreignKey: 'ownerId' });

// A User has Many Videos, a Video belongs to only one User
User.hasMany(Video, { foreignKey: 'ownerId', as: 'videos', onDelete: 'CASCADE' });
Video.belongsTo(User, { foreignKey: 'ownerId' });

// A User has One password, a Password belongs to only one User
User.hasOne(Password, { foreignKey: 'uid', as: 'password', onDelete: 'CASCADE' });
Password.belongsTo(User, { foreignKey: 'uid', as: 'user' });

// A User has One AuthToken, an AuthToken belongs to only one User
User.hasOne(AuthJWTToken, { foreignKey: 'uid', as: 'authJwtToken', onDelete: 'CASCADE' });
AuthJWTToken.belongsTo(User, { foreignKey: 'uid' });

module.exports = {
  User,
  Image,
  Audio,
  Video,
  Password,
  AuthJWTToken,
  Transaction,
  Gallery
};
