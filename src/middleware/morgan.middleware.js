const morgan = require('morgan');
const logger = require('../loggers/logger');

// Define a stream to write morgan logs to winston
const stream = {
  write: (message) => logger.debug(message.trim()),
};

// Define a morgan logging format
const morganMiddleware = morgan(
  // ':method :url :status :res[content-length] - :response-time ms',
  '[STATUS] :status [CONTENT] :res[content-length] - [EAT] :response-time ms',
  { stream }
);

module.exports = morganMiddleware;
