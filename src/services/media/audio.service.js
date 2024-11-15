const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const multer = require('multer');
const { NotFoundError, InternalServerError, UnauthorizedError } = require('../../errors/application-errors');
const { getFirebaseStorage } = require('../../database/firebase/init');
const { Audio } = require('../../database/models/init');
const logger = require('../../loggers/logger');
const galleryService = require('./gallery.service');
const { ref, uploadBytesResumable, getDownloadURL, deleteObject } = require('firebase/storage');
class audioService{
//################################################################## STORE audio IN MEMORY ######################################################################//
  // Multer configuration for file storage
  static upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
  }).single('file');

  static saveAudioToMemory = async (req, res) => {
    return new Promise((resolve, reject) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          logger.error(`Memory Upload error: ${err}`);
          return reject(new InternalServerError('Cannot save audio to memory'));
        }
        resolve(req.file);
      });
    });
  }
//################################################################## UPLOAD audio TO FIRESTORE ######################################################################//
  static UploadAudioToFirestoreDB = async (file, userId) => {
    try {
      const firebaseStorage = getFirebaseStorage();
      const fileName = `${Date.now()}_${file.originalname}`;
      const directory = `audios/${userId}/`;
      
      const fileRef = ref(firebaseStorage, `${directory}${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file.path);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const path = snapshot.metadata.fullPath;
      
      logger.info(`filename: ${fileName}`)
      logger.info(`path: ${snapshot.metadata.fullPath}`)
      logger.info(`Successfully uploaded audio: ${fileName}`);
      logger.info(`url: ${downloadURL}`)
      return { downloadURL, path } ;
    } catch (error) {
      logger.error(`Unable to upload audio to Firebase: ${error.message}`);
      throw new InternalServerError(`Unable to upload audio to Firebase, ${error.message}`);
    }
  };
//################################################################## SAVE AUDIO TO DATABASE ######################################################################//
  static UploadAudioToDB = async (req, file, downloadURL, path, galleryName) => {
    try {
      const userId = req.user.id;
      let gallery = await galleryService.findOne(galleryName, userId);

      if (!gallery) {
        gallery = await  galleryService.createGallery(galleryName, userId);
      }

      const newAudio = await Audio.create({
        filename: file.originalname,
        path: path,
        originalName: file.originalname,
        galleryId: gallery.id,
        galleryName: gallery.name,
        ownerId: userId,
        description: 'description',
        url: downloadURL,
      });
      logger.info(`Successfully saved audio: ${file.originalname}`);
      return newAudio;
    } catch (error) {
      logger.error(`Unable to Save audio to Database: ${error.message}`);
      throw new InternalServerError(`Unable to Save audio to Database, ${error.message}`);
    }
  };
//################################################################### GET ALL AUDIOS IN DB #####################################################################//
  static getAllAudioFiles = async () => {
    try {
      const audios = await Audio.findAll();
      if (!audios || audios.length === 0) {
        logger.warn(`audios not found`);
        return []
      }
      logger.info(`Successfully retrieved all ${audios.length} audios`);
      return audios;
    } catch (e) {
      logger.error(`Error retrieving all audios: ${e}`);
      throw new InternalServerError('Unable to retrieve all audios');
    }
  };
//########################################################################## GET ALL USER audios ##############################################################//
  static getAllUserAudioFiles = async (user) => {
    try {
      const audios = await Audio.findAll({ where: {ownerId: user.id} });
      if (!audios || audios.length === 0) {
        logger.warn(`audios not found`);
        return []
        // throw new NotFoundError(`No audios found for ${username}`);
      }
      logger.info(`Successfully retrieved ${audios.length} audios for ${user.username} ${user.id} ${user.email}`);
      return audios;
    } catch (e) {
      logger.error(`Error retrieving audios: ${e}`);
      throw new InternalServerError(`Unable to retrieve ${user.username}'s audios`);
    }
  };

  static getAudioFilesByGallery = async (user, galleryName) => {
    try {
      const audios = await Audio.findAll({ where: {ownerId: user.id, galleryName: galleryName} });
      if (!audios || audios.length === 0) {
        logger.warn(`audios not found`);
        return []
        // throw new NotFoundError(`No audios found for ${username}`);
      }
      logger.info(`Successfully retrieved ${audios.length} audios for ${user.username} ${user.id} ${user.email}`);
      return audios;
    } catch (e) {
      logger.error(`Error retrieving audios: ${e}`);
      throw new InternalServerError(`Unable to retrieve ${user.username}'s audios`);
    }
  };
//########################################################################## UPDATE AUDIO ##############################################################//
  static async updateAudioDetails(audioId, userId, newFilename, newDescription) {
    try {
      const audio = await Audio.findByPk(audioId);
      if (!audio) {
        logger.info(`Audio with id ${audioId} not found`);
        throw new NotFoundError(`Action Denied, audio not found`);
      }

      if(audio.ownerId != userId){
        logger.error('Unauthorized Update Request');
        throw new UnauthorizedError(`Action Denied, Owner Rights Restriction`);
      }

      audio.filename = newFilename || audio.filename;
      audio.description = newDescription || audio.description;

      await audio.save();

      logger.info(`Successfully updated audio ${audioId}`);
      return audio;
    } catch (e) {
      logger.error(`Error updating audio: ${e}`);
      throw new InternalServerError(`Unable to update audio ${audioId}`);
    }
  }
//########################################################################## Delete Audio ##############################################################//
  static deleteAudio = async (audioId, userId) => {
    try {
      const audio = await Audio.findByPk(audioId);

      if (!audio) {
        logger.error(`Audio with id ${audioId} not found`);
        throw new NotFoundError(`Action Denied, Audio not found`);
      }

      if(audio.ownerId != userId){
        logger.error('Unauthorized Delete Request');
        throw new UnauthorizedError(`Action Denied, Owner Rights Restriction`);
      }

      const firebaseStorage = getFirebaseStorage();
      const fileRef = ref(firebaseStorage, audio.url);

      await deleteObject(fileRef);
      await Audio.destroy({ where: { id: audioId } });

      logger.info(`Successfully deleted Audio: ${audio.filename} from storage and database`);
      return { message: 'Audio deleted successfully' };
    } catch (error) {
      logger.error(`Unable to delete Audio: ${error.message}`);
      throw new InternalServerError(`Unable to delete Audio, ${error.message}`);
    }
  };
}
module.exports = audioService;
