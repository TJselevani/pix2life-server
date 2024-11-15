const multer = require('multer');
const path = require('path');
const { InternalServerError } = require('../errors/application-errors');
const logger = require('../loggers/logger');


// Set up disk storage to save files in the 'uploads/' directory
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer instance using disk storage
const store = multer({ storage: diskStorage }).single('file');

// Define middleware function
const extractReqFileToStorage = (req, res, next) => {
  store(req, res, (err) => {
    if (err) {
      logger.error(`Storage error: ${err}`);
      return next(new InternalServerError('System unable to handle file! try again later.'));
    }
    logger.debug('Extracted Request File');
    next();
  });
};

module.exports = extractReqFileToStorage;
