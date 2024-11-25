// services/CloudinaryService.js
const { cloudinary } = require('../../database/cloudinary/init');

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
      console.error('Cloudinary upload error:', error);
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
      console.error('Cloudinary delete error:', error);
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
        console.warn(`Failed to delete ${resourceType}:`, result);
        return false; // Indicate failure
      }
    } catch (error) {
      console.error(`Cloudinary ${resourceType} delete error:`, error);
      throw new Error(`Failed to delete ${resourceType} from Cloudinary.`);
    }
  }
}

module.exports = CloudinaryService;
