
const multer = require('multer');
const path = require('path');
const { NotFoundError, InternalServerError } = require('../../errors/application-errors');
const logger = require('../../loggers/logger');
const ImageModel = require('../../database/models/image.model');

class Storage {
    
    // Multer configuration for file storage
    static storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, 'uploads/');
      },
      filename: function (req, file, cb) {
          cb(null, Date.now() + path.extname(file.originalname));
      }
    });

    static upload = multer({ storage: this.storage }).single('image');

    static uploadImage = async (req) => {
      return new Promise((resolve, reject) => {
          this.upload(req, req.res, (err) => {
              if (err) {
                  logger.error(`Upload error: ${err}`);
                  return reject(new InternalServerError('Cannot upload image'));
              }
              resolve(req.file);
          });
      });
    };
    
    static saveImageMetaData = async (file, req) => {
      try{
        const newImageDoc = new ImageModel({
          filename: file.filename,
          path: file.path,
          originalName: file.originalname,
          userId: req.user.id,
        });

        await newImageDoc.save();
      } catch (e) {
        logger.error(`MetaData cannot be saved ${e} `);
        throw new InternalServerError('Unable to save Image successfully');
      }
    }
  
    static getAllImages = async () => {
      try {
          const images = await ImageModel.find();
          if (!images) {
              throw new NotFoundError('No images found');
          }
          logger.info(`successfully retrieved ${images.length} images`);
          return images;
      } catch (e) {
          logger.error(`Error retrieving images: ${e}`);
          throw new InternalServerError('Unable to retrieve images');
      }
    };

    static getAllImagesByUser = async (id) => {
      try {
          const images = await ImageModel.find({userId: id});
          if (!images) {
              throw new NotFoundError('No images found');
          }
          logger.info(`successfully retrieved ${images.length} images`);
          return images;
      } catch (e) {
          logger.error(`Error retrieving images: ${e}`);
          throw new InternalServerError('Unable to retrieve images');
      }
    };


}
module.exports = Storage;
