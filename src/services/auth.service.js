const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('./user.service');
const { InternalServerError, BadRequestError } = require('../errors/application-errors');
const logger = require('../loggers/logger');
const AuthJWTToken = require('../database/models/token.model')

class AuthService {
    static validateUSer = async(userEmail, userPassword) => {
      const authUser = await userService.getUserByEmail(userEmail);
      if (authUser) {
        const storedPassword = await userService.getUserPassword(authUser.id);
        if (storedPassword) {
          const isPasswordValid = await AuthService.comparePasswords(userPassword, storedPassword);
          if (isPasswordValid) {
            return authUser;
          }         
        }
      }
      return null;
    }
    
    static hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    }

    static comparePasswords = async (password, hash) =>{
      return await bcrypt.compare(password, hash);
    }

    static generateToken = async (user) => {
      const payload = { id: user.id, username: user.username, email: user.email };
      return jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN  ?? '1h' });
    }

    static getTokenFromHeader = (headers) => {
        const token = headers.authorization;
        if (token && token.split(' ')[0] === 'Bearer') {
        return token.split(' ')[1];
        }
        return null;
    }

    static createAuthJWTToken = async (user) => {
      const token = await AuthService.generateToken(user);
      try {
          await AuthJWTToken.create({
            uid: user.id,
            token: token
          });
          return token;
      } catch (error) {
          logger.error(`${error.message}`)
          throw new InternalServerError(`Unable to Create Auth Token for ${user.username}`);
      }
    }

    static decodeToken = (token) => {
      return jsonwebtoken.decode(token, { complete: true });
    }

    static verifyToken = (token) => {
      return jsonwebtoken.verify(token, process.env.JWT_SECRET);
    }

    static validateToken = async (token) => {
     try {
        this.verifyToken(token);
        return true;
      } catch (error) {
        return false;
      }
    }
}

module.exports = AuthService;