const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
// const cv = require('opencv4nodejs');
const { NotFoundError, InternalServerError } = require('../../errors/application-errors');
const { getFirebaseStorage } = require('../../database/firebase/init');
const Image = require('../../database/models/image.model');
const logger = require('../../loggers/logger');
const { ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const { where } = require('sequelize');

class ImageService{
//################################################################## STORE IMAGE IN MEMORY ######################################################################//
  // Multer configuration for file storage
  static upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
  }).single('image');

  static saveImageToMemory = async (req, res) => {
    return new Promise((resolve, reject) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          logger.error(`Memory Upload error: ${err}`);
          return reject(new InternalServerError('Cannot save image to memory'));
        }
        resolve(req.file);
      });
    });
  }
//################################################################## UPLOAD IMAGE TO FIRESTORE ######################################################################//
  static UploadImageToFirestoreDB = async (file) => {
    try {
      const firebaseStorage = getFirebaseStorage();
      const fileName = `${Date.now()}_${file.originalname}`;
      const directory = 'images/';

      const fileRef = ref(firebaseStorage, `${directory}${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file.buffer);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      logger.info(`filename: ${fileName}`)
      logger.info(`path: ${snapshot.metadata.fullPath}`)
      logger.info(`Successfully uploaded image: ${fileName}`);
      logger.info(`url: ${downloadURL}`)
      return downloadURL;
    } catch (error) {
      logger.error(`Unable to upload Image to Firebase: ${error.message}`);
      throw new InternalServerError(`Unable to upload Image to Firebase, ${error.message}`);
    }
  };
//################################################################## SAVE IMAGE TO DATABASE ######################################################################//
  static UploadImageToDB = async (req, file, downloadURL) => {
    try {
      const newImage = await Image.create({
        filename: file.originalname,
        path: file.path,
        originalName: file.originalname,
        ownerId: req.user.id, // Assume this comes from the request body
        description: 'description', // Assume this comes from the request body
        url: downloadURL,
      });
      logger.info(`Successfully saved imag: ${file.originalname}`);
      return newImage;
    } catch (error) {
      logger.error(`Unable to Save Image to Database: ${error.message}`);
      throw new InternalServerError(`Unable to Save Image to Database, ${error.message}`);
    }
  };
//################################################################### GET ALL IMAGES IN DB #####################################################################//
  static getAllImages = async () => {
    try {
      const images = await Image.findAll();
      if (!images || images.length === 0) {
        throw new NotFoundError('No images found');
      }
      logger.info(`Successfully retrieved all ${images.length} images`);
      return images;
    } catch (e) {
      logger.error(`Error retrieving all images: ${e}`);
      throw new InternalServerError('Unable to retrieve all images');
    }
  };
//########################################################################## GET ALL USER IMAGES ##############################################################//
  static getAllUserImages = async (user) => {
    try {
      const images = await Image.findAll({ where: {ownerId: user.id} });
      if (!images || images.length === 0) {
        logger.info(`images: ${images}`);
        return []
        // throw new NotFoundError(`No images found for ${username}`);
      }
      logger.info(`Successfully retrieved ${images.length} images for ${user.username} ${user.id} ${user.email}`);
      return images;
    } catch (e) {
      logger.error(`Error retrieving images: ${e}`);
      throw new InternalServerError(`Unable to retrieve ${user.username}'s images`);
    }
  };
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Fetch the stored image URLs from your database $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  static async getImageURLs(userId) {
    return await Image.findAll({ attributes: ['imageUrl', 'features'], where: { ownerId: userId} });
  }

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Download images from Firebase Storage $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  static async downloadImage(imageUrl) {
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream',
    });
  
    const filePath = path.join(__dirname, 'temp', path.basename(imageUrl));
    const writer = fs.createWriteStream(filePath);
  
    response.data.pipe(writer);
  
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  }
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Extract features from the images using OpenCV: $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  static async extractORBFeatures(imagePath) {
    const image = cv.imread(imagePath);
    const gray = image.bgrToGray();
    const orb = new cv.ORBDetector();
    const keypoints = orb.detect(gray);
    const descriptors = orb.compute(gray, keypoints);
    return descriptors;
  }
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ Match the features of the query image with the features of the stored images $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  static async matchFeatures(descriptors1, descriptors2) {
    const bf = new cv.BFMatcher(cv.NORM_HAMMING, false);
    const matches = bf.match(descriptors1, descriptors2);
    return matches.length;
  }
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ IMAGE MATCHING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  static async matchImage(queryImagePath) {
    // Extract features from the query image
    const queryDescriptors = await this.extractORBFeatures(queryImagePath);
  
    // Get stored image URLs and features from the database
    const storedImages = await this.getImageURLs(userId);
  
    let bestMatch = null;
    let bestMatchCount = 0;
  
    for (const image of storedImages) {
      // Download the image from Firebase Storage
      const storedImagePath = await this.downloadImage(image.imageUrl);
  
      // Extract features from the stored image
      const storedDescriptors = await this.extractORBFeatures(storedImagePath);
  
      // Match features between the query image and the stored image
      const matchCount = await this.matchFeatures(queryDescriptors, storedDescriptors);
  
      // Update best match if current match is better
      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestMatch = image.imageUrl;
      }
  
      // Clean up the downloaded image
      fs.unlinkSync(storedImagePath);
    }
  
    return bestMatch;
  }
}
module.exports = ImageService;
