const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { NotFoundError, InternalServerError } = require('../../errors/application-errors');
const { getFirebaseStorage } = require('../../database/firebase/init');
const Audio = require('../../database/models/audio.model');
const logger = require('../../loggers/logger');
const { ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');

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
  static UploadAudioToFirestoreDB = async (file) => {
    try {
      const firebaseStorage = getFirebaseStorage();
      const fileName = `${Date.now()}_${file.originalname}`;
      const directory = 'audios/';
      
      const fileRef = ref(firebaseStorage, `${directory}${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file.buffer);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      logger.info(`filename: ${fileName}`)
      logger.info(`path: ${snapshot.metadata.fullPath}`)
      logger.info(`Successfully uploaded audio: ${fileName}`);
      logger.info(`url: ${downloadURL}`)
      return downloadURL;
    } catch (error) {
      logger.error(`Unable to upload audio to Firebase: ${error.message}`);
      throw new InternalServerError(`Unable to upload audio to Firebase, ${error.message}`);
    }
  };
//################################################################## SAVE AUDIO TO DATABASE ######################################################################//
  static UploadAudioToDB = async (req, file, downloadURL) => {
    try {
      const newAudio = await Audio.create({
        filename: file.originalname,
        path: file.path,
        originalName: file.originalname,
        ownerId: req.user.id, // Assume this comes from the request body
        description: 'description', // Assume this comes from the request body
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
        throw new NotFoundError('No audios found');
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
        logger.info(`audios: ${audios}`);
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
}
module.exports = audioService;
