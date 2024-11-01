const { NotFoundError } = require('../errors/application-errors');
const logger = require('../loggers/logger');
const authService = require('../services/auth.service');

function extractToken(req, res, next) {  
    const token = authService.getTokenFromHeader(req.headers);
    const decode = authService.decodeToken(token);
    if(decode == null){ throw new NotFoundError('Access Denied, no auth token')};
    logger.info('Token Verified ✔');
    req.user = decode.payload; // Attach token to the request object
    next(); // Call the next middleware or route handler
  }
module.exports = extractToken;