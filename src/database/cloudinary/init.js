const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');
const logger = require('../../loggers/logger');
const { InternalServerError } = require('../../errors/application-errors');

// Load environment variables
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  // eslint-disable-next-line no-undef
} = process.env;

// Initialize Cloudinary with environment variables
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Checks whether the connection to Cloudinary is successful.
 * @returns {Promise<boolean>} - Resolves to true if the connection is successful, otherwise throws an error.
 */
async function initCloudinary() {
  try {
    const result = await cloudinary.api.ping(); // Test connection
    if (result.status === 'ok') {
      logger.info('Cloudinary connection successful.');
      return true;
    }

    throw new InternalServerError('Unexpected response from Cloudinary.');
  } catch (error) {
    logger.error('Failed to connect to Cloudinary:', error.message);
    throw new InternalServerError(
      'Cloudinary connection failed. Please check your credentials.'
    );
  }
}

module.exports = {
  cloudinary,
  initCloudinary,
};
