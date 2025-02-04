// services/CloudinaryService.js
const { cloudinary } = require('../../database/cloudinary/init');
const logger = require('../../loggers/logger');

class CloudinaryService {
  static async uploadFile(filePath, folder) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto', // Automatically detect file type
      });

      const downloadURL = result.secure_url;
      const publicId = result.public_id;
      return { downloadURL, publicId }; // Return the URL of the uploaded file
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file to Cloudinary.');
    }
  }

  /**
   * Deletes a file from Cloudinary.
   * @param {string} publicId - The public ID of the file to delete.
   * @returns {Promise<boolean>} - True if the file was deleted, false otherwise.
   */
  static async deleteFile(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
      return true;
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete file from Cloudinary.');
    }
  }

  static async deleteResource(publicId, resourceType) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      if (result.result === 'ok') {
        return true; // Indicate success
      } else {
        logger.warn(`Failed to delete ${resourceType}:`, result);
        return false; // Indicate failure
      }
    } catch (error) {
      logger.error(`Cloudinary ${resourceType} delete error:`, error);
      throw new Error(`Failed to delete ${resourceType} from Cloudinary.`);
    }
  }
}

module.exports = CloudinaryService;
