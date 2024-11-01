const { Image } = require('../database/models/init')
const { Audio } = require('../database/models/init')
const { Video } = require('../database/models/init')
const { Gallery } = require('../database/models/init');
const { UnauthorizedError } = require('../errors/application-errors');
const userService = require('./user.service')

class PermissionService{
    static subscriptionLimits = {
        Regular: {
          maxGalleries: 3,
          maxPhotosPerGallery: 8,
        },
        Premium: {
          maxGalleries: 12,
          maxPhotosPerGallery: 24,
        },
        Unlimited: {
          maxGalleries: Infinity,
          maxPhotosPerGallery: Infinity,
        },
      };
      
    static async uploadImage(userId, galleryName){
        const user = await userService.getUserById(userId);

        const { maxGalleries, maxPhotosPerGallery } = this.subscriptionLimits[user.subscriptionPlan];

        const galleryCount = await Gallery.count({ where: { userId: user.id } });

        const photoCountInGallery = await Image.count({ where: { galleryName: galleryName } });

        if (galleryCount >= maxGalleries) {
            throw new UnauthorizedError('You have reached the maximum number of galleries for your subscription tier.');
        }

        if (photoCountInGallery >= maxPhotosPerGallery) {
            throw new UnauthorizedError('You have reached the maximum number of photos per gallery for your subscription tier.');
        }
    }

    static async uploadVideo(userId, galleryName){
        const user = await userService.getUserById(userId);

        const { maxGalleries, maxPhotosPerGallery } = this.subscriptionLimits[user.subscriptionPlan];

        const galleryCount = await Gallery.count({ where: { userId: user.id } });

        const photoCountInGallery = await Video.count({ where: { galleryName: galleryName } });

        if (galleryCount >= maxGalleries) {
            throw new UnauthorizedError('You have reached the maximum number of galleries for your subscription tier.');
        }

        if (photoCountInGallery >= maxPhotosPerGallery) {
            throw new UnauthorizedError('You have reached the maximum number of photos per gallery for your subscription tier.');
        }
    }

    static async uploadAudio(userId, galleryName){
        const user = await userService.getUserById(userId);

        const { maxGalleries, maxPhotosPerGallery } = this.subscriptionLimits[user.subscriptionPlan];

        const galleryCount = await Gallery.count({ where: { userId: user.id } });

        const photoCountInGallery = await Audio.count({ where: { galleryName: galleryName } });

        if (galleryCount >= maxGalleries) {
            throw new UnauthorizedError('You have reached the maximum number of galleries for your subscription tier.');
        }

        if (photoCountInGallery >= maxPhotosPerGallery) {
            throw new UnauthorizedError('You have reached the maximum number of photos per gallery for your subscription tier.');
        }
    }
}

module.exports = PermissionService;