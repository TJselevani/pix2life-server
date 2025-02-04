const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { promisify } = require('util');
// const cv = require('opencv4nodejs');
const {
  NotFoundError,
  InternalServerError,
  UnauthorizedError,
} = require('../../errors/application-errors');
const { getFirebaseStorage } = require('../../database/firebase/init');
const { Image } = require('../../database/models/init');
const logger = require('../../loggers/logger');
const galleryService = require('./gallery.service');
const {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require('firebase/storage');
const CloudinaryService = require('../storage/cloudinary.service');

const unlinkAsync = promisify(fs.unlink);
class ImageService {
  //################################################################## STORE IMAGE IN MEMORY ######################################################################//

  // Set up disk storage to save files in the 'uploads/' directory
  static diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  static store = multer({ storage: this.diskStorage }).single('file');

  static saveImageToStorage = async (req) => {
    return new Promise((resolve, reject) => {
      this.store(req, req.res, (err) => {
        if (err) {
          logger.error(`Upload error: ${err}`);
          return reject(new InternalServerError('Cannot Store file to Disk'));
        }
        resolve(req.file);
      });
    });
  };

  static async deleteImageFromStorage(filePath) {
    try {
      await unlinkAsync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      logger.error(`Error deleting file: ${error.message}`);
      throw new Error('Failed to delete file');
    }
  }

  // Multer configuration for file storage
  static upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
  }).single('file');

  static saveImageToMemory = async (req) => {
    return new Promise((resolve, reject) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          logger.error(`Memory Upload error: ${err}`);
          return reject(new InternalServerError('Cannot save image to memory'));
        }
        resolve(req.file);
      });
    });
  };
  //################################################################## UPLOAD IMAGE TO FIRESTORE ######################################################################//
  static UploadImageToFirestoreDB = async (file, userId) => {
    try {
      const firebaseStorage = getFirebaseStorage();
      const fileName = `${Date.now()}_${file.originalname}`;
      const directory = `images/${userId}/`;

      const fileRef = ref(firebaseStorage, `${directory}${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file.path);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const path = snapshot.metadata.fullPath;

      logger.debug(`filename: ${fileName}`);
      logger.debug(`path: ${snapshot.metadata.fullPath}`);
      logger.debug(`Successfully uploaded image: ${fileName}`);
      logger.debug(`url: ${downloadURL}`);
      return { downloadURL, path };
    } catch (error) {
      logger.error(`Unable to upload Image to Firebase: ${error.message}`);
      throw new InternalServerError(
        `Unable to upload Image to Firebase, ${error.message}`
      );
    }
  };
  //################################################################## SAVE IMAGE TO DATABASE ######################################################################//
  static UploadImageToDB = async (
    userId,
    file,
    downloadURL,
    publicId,
    galleryName,
    features
  ) => {
    try {
      let gallery = await galleryService.findOne(galleryName, userId);

      if (!gallery) {
        gallery = await galleryService.createGallery(galleryName, userId);
      }

      const newImage = await Image.create({
        filename: file.originalname,
        path: publicId,
        originalName: file.originalname,
        galleryId: gallery.id,
        galleryName: gallery.name,
        ownerId: userId,
        description: 'description',
        url: downloadURL,
        features: features,
      });
      logger.debug(
        `Successfully saved image to Database: ${file.originalname}`
      );
      return newImage;
    } catch (error) {
      logger.error(`Unable to Save Image to Database: ${error.message}`);
      throw new InternalServerError(
        `Unable to Save Image to Database, ${error.message}`
      );
    }
  };
  //################################################################### GET ALL IMAGES IN DB #####################################################################//
  static getAllImages = async () => {
    try {
      const images = await Image.findAll();
      if (!images || images.length === 0) {
        logger.warn(`images not found`);
        return [];
      }
      logger.debug(`Successfully retrieved all ${images.length} images`);
      return images;
    } catch (e) {
      logger.error(`Error retrieving all images: ${e}`);
      throw new InternalServerError('Unable to retrieve all images');
    }
  };
  //########################################################################## GET ALL USER IMAGES ##############################################################//
  static getAllUserImages = async (user) => {
    try {
      const images = await Image.findAll({ where: { ownerId: user.id } });
      if (!images || images.length === 0) {
        logger.warn(`images not found`);
        return [];
      }
      logger.debug(
        `Successfully retrieved ${images.length} images for ${user.username} ${user.id} ${user.email}`
      );
      return images;
    } catch (e) {
      logger.error(`Error retrieving images: ${e}`);
      throw new InternalServerError(
        `Unable to retrieve ${user.username}'s images`
      );
    }
  };

  static getAllUserImagesWithFeatures = async (user) => {
    try {
      const images = await Image.scope('withFeatures').findAll({
        where: { ownerId: user.id },
      });
      if (!images || images.length === 0) {
        logger.warn(`images not found`);
        return [];
      }
      logger.debug(
        `Successfully retrieved ${images.length} images for ${user.username} ${user.id} ${user.email}`
      );
      return images;
    } catch (e) {
      logger.error(`Error retrieving images: ${e}`);
      throw new InternalServerError(
        `Unable to retrieve ${user.username}'s images`
      );
    }
  };

  static getImagesByGallery = async (user, galleryName) => {
    try {
      const images = await Image.findAll({
        where: { ownerId: user.id, galleryName: galleryName },
      });
      if (!images || images.length === 0) {
        logger.warn(`images not found`);
        return [];
      }
      logger.debug(
        `Successfully retrieved ${images.length} images for ${user.username} ${user.id} ${user.email}`
      );
      return images;
    } catch (e) {
      logger.error(`Error retrieving images: ${e}`);
      throw new InternalServerError(
        `Unable to retrieve ${user.username}'s images`
      );
    }
  };
  //########################################################################## UPDATE IMAGE ##############################################################//
  static async updateImageDetails(
    imageId,
    userId,
    newFilename,
    newDescription
  ) {
    try {
      const image = await Image.findByPk(imageId);
      if (!image) {
        logger.error(`Image with id ${imageId} not found`);
        throw new NotFoundError(`Action Denied, Image not found`);
      }

      if (image.ownerId != userId) {
        logger.error('Unauthorized Update Request');
        throw new UnauthorizedError(`Action Denied, Owner Rights Restriction`);
      }

      image.filename = newFilename || image.filename;
      image.description = newDescription || image.description;

      await image.save();

      logger.debug(`Successfully updated image ${imageId}`);
      return image;
    } catch (e) {
      logger.error(`Error updating image: ${e}`);
      throw new InternalServerError(`Unable to update image ${imageId}`);
    }
  }
  //########################################################################## Delete IMAGE ##############################################################//
  static deleteImage = async (imageId, userId) => {
    try {
      const image = await Image.findByPk(imageId);

      if (!image) {
        logger.error(`Image with id ${imageId} not found`);
        throw new NotFoundError(`Action Denied, Image not found`);
      }

      if (image.ownerId != userId) {
        logger.error('Unauthorized Delete Request');
        throw new UnauthorizedError(`Action Denied, Owner Rights Restriction`);
      }

      await CloudinaryService.deleteResource(image.path, 'image');

      await Image.destroy({ where: { id: imageId } });

      logger.debug(
        `Successfully deleted image: ${image.filename} from storage and database`
      );
      return { message: `Image ${image.filename} deleted successfully` };
    } catch (error) {
      logger.error(`Unable to delete Image: ${error.message}`);
      throw new InternalServerError(`Unable to delete Image, ${error.message}`);
    }
  };
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Fetch the stored image URLs from your database $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  static async getImageURLs(userId) {
    return await Image.findAll({
      attributes: ['imageUrl', 'features'],
      where: { ownerId: userId },
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Download images from Firebase Storage $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  static async downloadImage(imageUrl) {
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream',
    });

    // eslint-disable-next-line no-undef
    const filePath = path.join(__dirname, 'temp', path.basename(imageUrl));
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Extract features from the images using OpenCV: $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // static async extractORBFeatures(imagePath) {
  //   const image = cv.imread(imagePath);
  //   const gray = image.bgrToGray();
  //   const orb = new cv.ORBDetector();
  //   const keypoints = orb.detect(gray);
  //   const descriptors = orb.compute(gray, keypoints);
  //   return descriptors;
  // }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Match the features of the query image with the features of the stored images $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // static async matchFeatures(descriptors1, descriptors2) {
  //   const bf = new cv.BFMatcher(cv.NORM_HAMMING, false);
  //   const matches = bf.match(descriptors1, descriptors2);
  //   return matches.length;
  // }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ IMAGE MATCHING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // static async matchImage(queryImagePath) {
  //   // Extract features from the query image
  //   const queryDescriptors = await this.extractORBFeatures(queryImagePath);

  //   // Get stored image URLs and features from the database
  //   const storedImages = await this.getImageURLs(userId);

  //   let bestMatch = null;
  //   let bestMatchCount = 0;

  //   for (const image of storedImages) {
  //     // Download the image from Firebase Storage
  //     const storedImagePath = await this.downloadImage(image.imageUrl);

  //     // Extract features from the stored image
  //     const storedDescriptors = await this.extractORBFeatures(storedImagePath);

  //     // Match features between the query image and the stored image
  //     const matchCount = await this.matchFeatures(
  //       queryDescriptors,
  //       storedDescriptors
  //     );

  //     // Update best match if current match is better
  //     if (matchCount > bestMatchCount) {
  //       bestMatchCount = matchCount;
  //       bestMatch = image.imageUrl;
  //     }

  //     // Clean up the downloaded image
  //     fs.unlinkSync(storedImagePath);
  //   }

  //   return bestMatch;
  // }
}
module.exports = ImageService;
