const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const multer = require('multer');
const { NotFoundError, InternalServerError } = require('../../errors/application-errors');
const { getFirebaseStorage } = require('../../database/firebase/init');
const { Video } = require('../../database/models/init');
const galleryService = require('./gallery.service')
const logger = require('../../loggers/logger');
const { ref, uploadBytesResumable, getDownloadURL, deleteObject } = require('firebase/storage');
class VideoService{
//################################################################## STORE VIDEO IN MEMORY ######################################################################//
  // Multer configuration for file storage
  static upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
  }).single('file');

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
  static UploadVideoToFirestoreDB = async (file, userId) => {
    try {
      const firebaseStorage = getFirebaseStorage();
      const fileName = `${Date.now()}_${file.originalname}`;
      const directory = `videos/${userId}/`;

      const fileRef = ref(firebaseStorage, `${directory}${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file.buffer);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const path = snapshot.metadata.fullPath;
      
      logger.info(`filename: ${fileName}`)
      logger.info(`path: ${snapshot.metadata.fullPath}`)
      logger.info(`Successfully uploaded video: ${fileName}`);
      logger.info(`url: ${downloadURL}`)
      return { downloadURL, path};
    } catch (error) {
      logger.error(`Unable to upload video to Firebase: ${error.message}`);
      throw new InternalServerError(`Unable to upload video to Firebase, ${error.message}`);
    }
  };
//################################################################## SAVE VIDEO TO DATABASE ######################################################################//
  static UploadVideoToDB = async (req, file, downloadURL, path, galleryName) => {
    try {
      const userId = req.user.id;
      let gallery = await galleryService.findOne(galleryName, userId);

      if (!gallery) {
        gallery = await  galleryService.createGallery(galleryName, userId);
      }

      const newVideo = await Video.create({
        filename: file.originalname,
        path: path,
        originalName: file.originalname,
        galleryId: gallery.id,
        galleryName: gallery.name,
        ownerId: userId, 
        description: 'description',
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
        logger.warn(`audios not found`);
        return []
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
        logger.warn(`videos not found`);
        return []
      }
      logger.info(`Successfully retrieved ${videos.length} videos for ${user.username} ${user.id} ${user.email}`);
      return videos;
    } catch (e) {
      logger.error(`Error retrieving videos: ${e}`);
      throw new InternalServerError(`Unable to retrieve ${user.username}'s videos`);
    }
  };

  static getVideosByGallery = async (user, galleryName) => {
    try {
      const videos = await Video.findAll({ where: {ownerId: user.id, galleryName: galleryName} });
      if (!videos || videos.length === 0) {
        logger.warn(`videos not found`);
        return []
      }
      logger.info(`Successfully retrieved ${videos.length} videos for ${user.username} ${user.id} ${user.email}`);
      return videos;
    } catch (e) {
      logger.error(`Error retrieving videos: ${e}`);
      throw new InternalServerError(`Unable to retrieve ${user.username}'s videos`);
    }
  };
//########################################################################## UPDATE VIDEO ##############################################################//
  static async updateVideoDetails(videoId, userId, newFilename, newDescription) {
    try {
      const video = await Video.findByPk(videoId);
      if (!video) {
        logger.info(`video with id ${videoId} not found`);
        throw new NotFoundError(`Action Denied, video not found`);
      }

      if(video.ownerId != userId){
        logger.error('Unauthorized Delete Request');
        throw new UnauthorizedError(`Action Denied, Owner Rights Restriction`);
      }

      video.filename = newFilename || video.filename;
      video.description = newDescription || video.description;

      await video.save();

      logger.info(`Successfully updated video ${videoId}`);
      return video;
    } catch (e) {
      logger.error(`Error updating video: ${e}`);
      throw new InternalServerError(`Unable to update video ${videoId}`);
    }
  }
//########################################################################## Delete Video ##############################################################//
  static deleteVideo = async (videoId, userId) => {
    try {
      const video = await Video.findByPk(videoId);

      if (!video) {
        logger.error(`Video with id ${videoId} not found`);
        throw new NotFoundError(`Action Denied, Video not found`);
      }

      if(video.ownerId != userId){
        logger.error('Unauthorized Delete Request');
        throw new UnauthorizedError(`Action Denied, Owner Rights Restriction`);
      }

      const firebaseStorage = getFirebaseStorage();
      const fileRef = ref(firebaseStorage, video.url);

      await deleteObject(fileRef);
      await Video.destroy({ where: { id: videoId } });

      logger.info(`Successfully deleted Video: ${video.filename} from storage and database`);
      return { message: 'Video deleted successfully' };
    } catch (error) {
      logger.error(`Unable to delete Video: ${error.message}`);
      throw new InternalServerError(`Unable to delete Video, ${error.message}`);
    }
  };
}
module.exports = VideoService;
