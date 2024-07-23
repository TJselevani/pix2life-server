const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const multer = require('multer');
const path = require('path');
const { NotFoundError, InternalServerError } = require('../../errors/application-errors');
const { getFirebaseStorage } = require('../../database/firebase/init');
const Video = require('../../database/models/video.model');
const logger = require('../../loggers/logger');
const { ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');

class VideoService{
//################################################################## STORE VIDEO IN MEMORY ######################################################################//
  // Multer configuration for file storage
  static upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
  }).single('video');

  static saveVideoToMemory = async (req, res) => {
    return new Promise((resolve, reject) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          logger.error(`Memory Upload error: ${err}`);
          return reject(new InternalServerError('Cannot save video to memory'));
        }
        resolve(req.file);
      });
    });
  }
//################################################################## UPLOAD VIDEO TO FIRESTORE ######################################################################//
  static UploadVideoToFirestoreDB = async (file) => {
    try {
      const firebaseStorage = getFirebaseStorage();
      const fileName = `${Date.now()}_${file.originalname}`;
      const directory = 'videos/';

      const fileRef = ref(firebaseStorage, `${directory}${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file.buffer);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      logger.info(`filename: ${fileName}`)
      logger.info(`path: ${snapshot.metadata.fullPath}`)
      logger.info(`Successfully uploaded video: ${fileName}`);
      logger.info(`url: ${downloadURL}`)
      return downloadURL;
    } catch (error) {
      logger.error(`Unable to upload video to Firebase: ${error.message}`);
      throw new InternalServerError(`Unable to upload video to Firebase, ${error.message}`);
    }
  };
//################################################################## SAVE VIDEO TO DATABASE ######################################################################//
  static UploadVideoToDB = async (req, file, downloadURL) => {
    try {
      const newVideo = await Video.create({
        filename: file.originalname,
        path: file.path,
        originalName: file.originalname,
        ownerId: req.user.id, // Assume this comes from the request body
        description: 'description', // Assume this comes from the request body
        url: downloadURL,
      });
      logger.info(`Successfully saved video: ${file.originalname}`);
      return newVideo;
    } catch (error) {
      logger.error(`Unable to Save video to Database: ${error.message}`);
      throw new InternalServerError(`Unable to Save Video to Database, ${error.message}`);
    }
  };
//################################################################### GET ALL VIDEOS IN DB #####################################################################//
  static getAllVideos = async () => {
    try {
      const videos = await Video.findAll();
      if (!videos || videos.length === 0) {
        throw new NotFoundError('No videos found');
      }
      logger.info(`Successfully retrieved all ${videos.length} videos`);
      return videos;
    } catch (e) {
      logger.error(`Error retrieving all videos: ${e}`);
      throw new InternalServerError('Unable to retrieve all videos');
    }
  };
//########################################################################## GET ALL USER VIDEOS ##############################################################//
  static getAllUserVideos = async (user) => {
    try {
      const videos = await Video.findAll({ where: {ownerId: user.id} });
      if (!videos || videos.length === 0) {
        logger.info(`videos: ${videos}`);
        return []
        // throw new NotFoundError(`No videos found for ${username}`);
      }
      logger.info(`Successfully retrieved ${videos.length} videos for ${user.username} ${user.id} ${user.email}`);
      return videos;
    } catch (e) {
      logger.error(`Error retrieving videos: ${e}`);
      throw new InternalServerError(`Unable to retrieve ${user.username}'s videos`);
    }
  };
}
module.exports = VideoService;
