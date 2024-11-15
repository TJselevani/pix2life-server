const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError, NotFoundError, NoContentFound } = require("../errors/application-errors");
const audioService = require("../services/media/audio.service");
const FileStorage = require('../util/clean-up-file');


const uploadAudio = asyncHandler(async (req, res,) => {
    const file = req.file;
    const userId  =req.user.id;
    const galleryName = req.query.galleryName;

    if (!file) {
        throw new BadRequestError('Audio File not found/supported');
    }

    if(!galleryName){
        throw new BadRequestError('No Gallery Specified'); 
    }

    // const file = await audioService.saveAudioToMemory(audio);
    const { downloadURL, path }  = await audioService.UploadAudioToFirestoreDB(file, userId);
    const newAudio = await audioService.UploadAudioToDB(req, file, downloadURL, path, galleryName);

    if (newAudio) {
        // await saveAudioMetaDataDB(file);
        logger.info( `Successfully created file: ${file.originalname}`);
        res.status(201).json({ message: `Successfully uploaded file: ${file.originalname}` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }

     //delete the file from disk if no longer needed
     await FileStorage.cleanupFile(file.path);
});

const getAllAudioFiles = asyncHandler(async (req, res, next) => {
    const audios = await audioService.getAllAudioFiles();
    res.status(200).json(audios);
});

const getUserAudioFiles = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const audios = await audioService.getAllUserAudioFiles(user);
    res.status(200).json(audios);
});

const getAudioFilesByGallery = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const galleryName = req.query.galleryName;
    const audios = await audioService.getAudioFilesByGallery(user, galleryName);
    res.status(200).json(audios);
});

const updateAudio = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { audioId } = req.query;
    const newFilename = req.body.filename
    const newDescription = req.body.description
    
    if(audioId == undefined || audioId == null){
        throw new NotFoundError('Resource ID missing')
    }
    const updatedAudio = await audioService.updateAudioDetails(audioId, userId, newFilename, newDescription);
    res.status(201).json({ message: 'Audio updated successfully', updatedAudio: updatedAudio });
    
}); 

const deleteAudio = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { audioId } = req.query;

    if(audioId == undefined || audioId == null){
        throw new NotFoundError('Resource ID missing')
    }

    const response = await audioService.deleteAudio(audioId, userId);
    res.status(201).json(response);
});    

module.exports = { uploadAudio, getAllAudioFiles, getUserAudioFiles, getAudioFilesByGallery, updateAudio, deleteAudio }