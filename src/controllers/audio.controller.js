const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError, NotFoundError, NoContentFound } = require("../errors/application-errors");
const audioService = require("../services/media/audio.service");


const uploadAudio = asyncHandler(async (req, res,) => {
    const audio = req;
    const userId  =req.user.id;
    const galleryName = req.query.galleryName;
    if(!galleryName){
        throw new BadRequestError('No Gallery Specified'); 
    }
    const file = await audioService.saveAudioToMemory(audio);
    const { downloadURL, path }  = await audioService.UploadAudioToFirestoreDB(file, userId);
    const newAudio = await audioService.UploadAudioToDB(req, file, downloadURL, path, galleryName);

    if (newAudio) {
        // await saveAudioMetaDataDB(file);
        logger.info( `Successfully created file: ${file.originalname}`);
        res.status(201).json({ message: `Successfully uploaded file: ${file.originalname}` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }
});

const getAllAudioFiles = asyncHandler(async (req, res, next) => {
    const audios = await audioService.getAllAudioFiles();
    res.json(audios);
});

const getUserAudioFiles = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const audios = await audioService.getAllUserAudioFiles(user);
    res.json(audios);
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
    res.json(response);
});    

module.exports = { uploadAudio, getAllAudioFiles, getUserAudioFiles, updateAudio, deleteAudio }