const {
  NotFoundError,
  InternalServerError,
} = require('../../errors/application-errors');
const { Gallery } = require('../../database/models/init');
const logger = require('../../loggers/logger');

class GalleryService {
  static async findOne(galleryName, userId) {
    try {
      const gallery = await Gallery.findOne({
        where: {
          name: galleryName,
          userId: userId,
        },
      });
      logger.debug(`successfully retrieved gallery, ${galleryName}`);
      return gallery;
    } catch (error) {
      logger.error(`Failed to retrieve gallery: ${error}`);
      throw new InternalServerError('Gallery issue');
    }
  }

  static async findAll(userId) {
    try {
      const gallery = await Gallery.findAll({
        where: {
          userId: userId,
        },
      });
      logger.debug(`successfully retrieved gallery for ${userId}`);
      return gallery;
    } catch (error) {
      logger.error(`Failed to retrieve gallery: ${error}`);
      throw new InternalServerError('Gallery issue');
    }
  }

  static async createGallery(galleryName, userId) {
    try {
      const gallery = await Gallery.create({
        name: galleryName,
        userId: userId,
      });
      logger.debug(`successfully created gallery, ${galleryName}`);
      return gallery;
    } catch (error) {
      logger.error(`Failed to Create gallery: ${error}`);
      throw new InternalServerError('Failed to create gallery');
    }
  }

  static async createNewGallery(userId, galleryName, description, downloadURL) {
    try {
      const gallery = await Gallery.create({
        name: galleryName,
        description: description,
        iconUrl: downloadURL,
        userId: userId,
      });
      logger.debug(`successfully created New Gallery, ${galleryName}`);
      return gallery;
    } catch (error) {
      logger.error(`Failed to Create gallery: ${error}`);
      throw new InternalServerError('Failed to create gallery');
    }
  }

  static async updateGallery(
    userId,
    galleryName,
    newName,
    newDescription,
    newUrl
  ) {
    try {
      const gallery = this.findOne(galleryName, userId);
      if (!gallery) {
        logger.error(
          `gallery ${galleryName} with user id ${userId} is not found`
        );
        throw new NotFoundError(`Action Denied`);
      }

      gallery.name = newName || gallery.name;
      gallery.description = newDescription || gallery.description;
      gallery.iconUrl = newUrl || gallery.iconUrl;

      await gallery.save;
      logger.debug('successfully updated gallery');
    } catch (error) {
      logger.error(`Unable to update gallery ${galleryName}: ${error.message}`);
      throw new InternalServerError(`Unable to update gallery, ${galleryName}`);
    }
  }

  static async deleteGallery(galleryName, userId) {
    try {
      const gallery = this.findOne(galleryName, userId);
      if (!gallery) {
        logger.error(
          `gallery ${galleryName} with user id ${userId} is not found`
        );
        throw new NotFoundError(`Action Denied`);
      }

      Gallery.destroy({ where: { id: gallery.id } });
    } catch (error) {
      logger.error(`Unable to delete gallery ${galleryName}: ${error.message}`);
      throw new InternalServerError(`Unable to delete gallery, ${galleryName}`);
    }
  }
}

module.exports = GalleryService;
