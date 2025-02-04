const {
  InternalServerError,
  BadRequestError,
  NotFoundError,
} = require('../errors/application-errors');
const { User } = require('../database/models/init');
const { Password } = require('../database/models/init');
const emailService = require('./notification.service');
const authService = require('./auth.service');
const logger = require('../loggers/logger');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
class UserService {
  //############################################################## CREATE USER ##################################################################
  /**
   * Uploads a new user to the Firestore database.
   * @param {Object} userData - The user data object.
   * @returns {Promise<User>} - The created user.
   */
  static createUser = async (userData) => {
    const userExists = await this.getUserByEmail(userData.email);
    if (userExists == null) {
      try {
        const user = await User.create(userData);
        return user;
      } catch (error) {
        throw new InternalServerError(`Failed to create user: ${error}`);
      }
    }
    throw new BadRequestError('User Already Exists');
  };
  //############################################################ NOTIFY USER #######################################################################
  static welcomeEmail = async (user) => {
    // Send welcome email
    const to = user.email;
    const subject = 'Welcome to PIX2LIFE';
    const text = `Hi there ${user.name}, we are exited to have you register with us`;
    const html = `<p>Your Username is your Email, ${user.email}</p><br/><p>Welcome to our service!</p>`;
    await emailService.sendEmail(to, subject, text, html);
  };
  //############################################################ CREATE PASSWORD #######################################################################
  /**
   * Uploads a new user password to the Firestore database.
   * @param {object} user - The user object.
   * @param {String} hashedPassword - The hashed password.
   * @returns {String} - The created user.
   */
  static createPassword = async (user, hashedPassword) => {
    try {
      const password = await Password.create({
        uid: user.id,
        hash: hashedPassword,
      });
      return password.hash;
    } catch (error) {
      logger.error(`${error.message}`);
      throw new InternalServerError(
        `Unable to Create Password for ${user.name}`
      );
    }
  };

  static updatePassword = async (user, newHashedPassword) => {
    try {
      const updatedPassword = await Password.update(
        { hash: newHashedPassword },
        { where: { uid: user.id } }
      );

      if (updatedPassword[0] === 0) {
        // If no rows were affected
        throw new Error('Password update failed');
      }

      return updatedPassword.hash;
    } catch (error) {
      logger.error(
        `Unable to Update Password for ${user.name}: ${error.message}`
      );
      throw new InternalServerError(
        `Unable to Update Password for ${user.name}`
      );
    }
  };

  //############################################################## GET ALL USERS #####################################################################
  /**
   * Retrieves all users from the Firestore database.
   * @returns {Promise<User[]>} The list of users.
   */
  static async getAllUsers() {
    try {
      const users = await User.findAll();
      if (!users || users.length === 0) {
        return null;
      }
      logger.info(`Fetched ${users.length} users.`);
      return users;
    } catch (error) {
      logger.error(`Failed to retrieve all users: ${error.message}`);
      throw new InternalServerError(`Failed to retrieve all users`);
    }
  }

  //################################################################# GET USER BT ID ##################################################################
  /**
   * Retrieves a user by ID from the Firestore database.
   * @param {string} id - The ID of the user.
   * @returns {Promise<User|null>} The user data or null if not found.
   */
  static async getUserById(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      logger.error(`Failed to Retrieve Data by ID: ${error.message}`);
      throw new InternalServerError(`Failed to retrieve data`);
    }
  }
  //################################################################ GEY USER BUY FIELD ###################################################################
  /**
   * Retrieves a user by a specified field (e.g., email) from the Firestore database.
   * @param {string} field - The field to query by (e.g., 'email').
   * @param {string} value - The value to search for.
   * @returns {Promise<User|null>} The user data or null if not found.
   */
  static getUserByField = async (field, value) => {
    try {
      const user = await User.findOne({
        where: {
          field: value,
        },
      });

      if (!user) {
        logger.info(`User with ${field} as ${value} not found.`);
        return null;
      }

      logger.info(`User found: ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      logger.error(`${error.message}`);
      throw new InternalServerError(`Failed to retrieve data by`);
    }
  };
  //############################################################# GET USER BY EMAIL ######################################################################
  /**
   * Retrieves a user by a specified field (e.g., email) from the Firestore database.
   * @param {string} email - The field of the query.
   * @returns {Promise<User|null>} The user data or null if not found.
   */
  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        logger.warn(`User with email ${email} not found.`);
        return null;
      }

      //logger.info(`User found: ${JSON.stringify(user)}`);
      logger.info(`User successfully retrieved`);
      return user;
    } catch (error) {
      logger.error(`Unable to retrieve user by email: ${error}`);
      throw new InternalServerError(`Failed to retrieve user by email`);
    }
  }
  //################################################################ GET USER BY TOKEN ###################################################################
  /**
   * Retrieves a user by a specified field (e.g., email) from the Firestore database.
   * @param {string} token - The field of the query.
   * @returns {Promise<User|null>} The user data or null if not found.
   */
  static getUserByToken = async (token) => {
    const verifiedToken = await authService.validateToken(token);
    if (!verifiedToken) {
      throw new BadRequestError('Invalid Token');
    }
    const decode = authService.decodeToken(token);

    const user = await this.getUserById(decode.payload.id);
    if (!user) {
      throw new NotFoundError('User Does not Exist');
    }
    return user;
  };
  //################################################################## GET USER PASSWORD #################################################################
  /**
   * Retrieves a user by a specified field (e.g., email) from the Firestore database.
   * @param {string} id - The field of the query.
   * @returns {string|null} The user data or null if not found.
   */
  static getUserPassword = async (id) => {
    try {
      const password = await Password.findOne({
        where: {
          uid: id,
        },
      });

      if (!password) {
        logger.info(`password not found for Id: ${id}.`);
        return null;
      }
      logger.info(`Password found: ${JSON.stringify(password.hash)}`);
      return password.hash;
    } catch (error) {
      logger.error(`Error fetching user: ${error}`);
      throw new Error('Could not fetch user Password');
    }
  };
  //################################################################## UPDATE USER DATA #################################################################
  /**
   * Updates a user by ID in the Firestore database.
   * @param {string} id - The ID of the user.
   * @param {Object} updateData - The new data for the user.
   */
  static async updateUser(id, updateData) {
    try {
      const user = await this.getUserById(id);
      if (user) {
        await user.update(updateData);
        logger.info(`Updated Data for ID ${id}`);
        return user;
      }
      throw new BadRequestError('Cannot update user');
    } catch (error) {
      throw new InternalServerError(`Failed to update data: ${error}`);
    }
  }

  static async updateUserAvatar(userId, newAvatarUrl) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        logger.error(`User with id ${userId} not found`);
        throw new NotFoundError(`Action Denied, User not found`);
      }

      user.avatarUrl = newAvatarUrl || user.avatarUrl;

      await user.save();

      logger.info(`Successfully updated avatar URL for user ${userId}`);
      return user.avatarUrl;
    } catch (e) {
      logger.error(`Error updating avatar URL: ${e}`);
      throw new InternalServerError(
        `Unable to update avatar URL for user ${userId}`
      );
    }
  }
  //################################################################## UPDATE USER DATA #################################################################
  static async updateUserLoginDate(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`User with id ${userId} not found`);
      }

      user.lastLogin = new Date();

      await user.save();
    } catch (error) {
      logger.warn(`User Login Update Error: ${error}`);
      //   throw new InternalServerError('Update Error');
    }
  }

  static async retrieveUserLoginDate(userId) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        logger.warn(`User with id ${userId} not found`);
      }

      return user.lastLogin ? user.lastLogin.toISOString() : 'Never logged in';
    } catch (error) {
      logger.warn(`User Retrieve Login Error ${error}`);
    }
  }

  //#################################################################### DELETE USER ###############################################################
  /**
   * Deletes a user by ID from the Firestore database.
   * @param {string} id - The ID of the user.
   */
  static async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (user) {
        await user.destroy();
        logger.info(`Deleted Data for ID ${id}`);
        return true;
      }
      throw new BadRequestError('Unable to delete user');
    } catch (error) {
      logger.error(`Failed to delete data: ${error}`);
    }
  }
  //#################################################################### USER Forgot Password ###############################################################
  static async handleForgotPassword(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        logger.warn(`User with Email ${email} not found`);
        throw new BadRequestError(`User with Email ${email} not found`);
      }

      const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      logger.info(`Reset code: ${resetCode}`);
      user.resetCode = resetCode;
      user.resetCodeExpires = Date.now() + 3600000; // 1 hour

      await user.save();

      const to = user.email;
      const subject = 'Password Reset Code';
      const text = `Your password reset code is ${resetCode}`;
      const html = `<p>Do not share your CODE with anyone anonymous</p> <br/> <p>${resetCode}</p> </br> <p>Thank you for using our service!</p>`;
      await emailService.sendEmail(to, subject, text, html);
    } catch (error) {
      logger.error(`Handling Forgot Password error: ${error}`);
      throw new InternalServerError('Email Account does not exist');
    }
  }
  //#################################################################### USER Forgot Password ###############################################################
  static async handleVerifyResetCode(email, resetCode) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new BadRequestError(`User with Email ${email} not found`);
      }

      if (user.resetCode != resetCode) {
        throw new BadRequestError('Invalid Reset Code');
      }
      return true;
    } catch (error) {
      logger.error(`Verifying Reset Code: ${error}`);
      throw new InternalServerError('Invalid Code');
    }
  }
  //#################################################################### USER Reset Password ###############################################################
  static async handleResetPassword(email, resetCode, password) {
    try {
      const newHashedPassword = await this.hashPassword(password);

      const user = await User.findOne({
        where: {
          email: email,
          resetCode: resetCode,
          resetCodeExpires: {
            [Op.gt]: Date.now(),
          },
        },
      });

      if (!user) {
        throw new BadRequestError('The reset code is invalid or has expired');
      }

      await this.updatePassword(user, newHashedPassword);

      user.resetCode = undefined;
      user.resetCodeExpires = undefined;

      await user.save();
    } catch (error) {
      logger.error(`Handling Reset Password Error: ${error}`);
      throw new InternalServerError('failed to Reset Password');
    }
  }

  static hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };
}

module.exports = UserService;
