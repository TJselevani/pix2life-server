const logger = require('../loggers/logger');
const {
  ApplicationError,
  InternalServerError,
} = require('./application-errors');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error caught by errorHandler: ${err.message}`); // Log the error for debugging purposes

  if (err instanceof ApplicationError) {
    return res.status(err.status).json(err.serialize());
  } else {
    const internalError = new InternalServerError();
    return res.status(internalError.status).json(internalError.serialize());
  }
};

module.exports = errorHandler;
