const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('./user.service');
const { InternalServerError } = require('../errors/application-errors');
const logger = require('../loggers/logger');
const { AuthJWTToken } = require('../database/models/init');
const crypto = require('crypto');
const { Buffer } = require('node:buffer');

class AuthService {
  static validateUSer = async (userEmail, userPassword) => {
    const authUser = await userService.getUserByEmail(userEmail);
    if (authUser) {
      const storedPassword = await userService.getUserPassword(authUser.id);
      if (storedPassword) {
        const isPasswordValid = await AuthService.comparePasswords(
          userPassword,
          storedPassword
        );
        if (isPasswordValid) {
          return authUser;
        }
      }
    }
    return null;
  };

  static hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  static comparePasswords = async (password, hash) => {
    return await bcrypt.compare(password, hash);
  };

  static generateToken = async (user) => {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: new Date().toISOString(),
    };
    // eslint-disable-next-line no-undef
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
      // eslint-disable-next-line no-undef
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    });
  };

  static getTokenFromHeader = (headers) => {
    const token = headers.authorization;
    if (token && token.split(' ')[0] === 'Bearer') {
      return token.split(' ')[1];
    }
    return null;
  };

  static createAuthJWTToken = async (user) => {
    const token = await AuthService.generateToken(user);
    try {
      await AuthJWTToken.create({
        uid: user.id,
        token: token,
      });
      return token;
    } catch (error) {
      logger.error(`${error.message}`);
      throw new InternalServerError(
        `Unable to Create Auth Token for ${user.username}`
      );
    }
  };

  static decodeToken = (token) => {
    return jsonwebtoken.decode(token, { complete: true });
  };

  static verifyToken = (token) => {
    // eslint-disable-next-line no-undef
    return jsonwebtoken.verify(token, process.env.JWT_SECRET);
  };

  static validateToken = async (token) => {
    try {
      this.verifyToken(token);
      return true;
    } catch (error) {
      logger.warn(error);
      return false;
    }
  };

  // Function to encrypt a public ID
  static encryptPublicId(publicId, encryptionKey) {
    const iv = crypto.randomBytes(16); // Generate a random initialization vector
    const cipher = crypto.createCipheriv(
      'aes-128-cbc',
      Buffer.from(encryptionKey),
      iv
    );
    let encrypted = cipher.update(publicId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Return IV and encrypted data
  }

  // Function to decrypt the public ID
  static decryptPublicId(encryptedData, encryptionKey) {
    const parts = encryptedData.split(':'); // Split IV and encrypted data
    const iv = Buffer.from(parts.shift(), 'hex'); // Get the IV
    const encryptedText = Buffer.from(parts.join(':'), 'hex'); // Get the encrypted text
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(encryptionKey),
      iv
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted; // Return the decrypted public ID
  }

  static encryptionKey = crypto.randomBytes(32).toString('hex');
}

module.exports = AuthService;
