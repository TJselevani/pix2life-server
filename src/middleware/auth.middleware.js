const { UnauthorizedError } = require('../errors/application-errors');
const logger = require('../loggers/logger');
const authService = require('../services/auth.service');

function authUserToken(req, res, next) {  
    const token = authService.getTokenFromHeader(req.headers);
    const decode = authService.decodeToken(token);
    if(decode == null){ throw new UnauthorizedError('Access Denied, no auth token')};
    logger.info(`Extracted Auth Token, ID: ${decode.payload.id} name: ${decode.payload.username} email:${decode.payload.email}`);
    req.user = decode.payload; // Attach token to the request object
    next(); // Call the next middleware or route handler
  }
module.exports = authUserToken;