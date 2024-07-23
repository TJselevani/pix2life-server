const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError } = require("../errors/application-errors");
const audioService = require("../services/media/audio.service");


const uploadAudio = asyncHandler(async (req, res,) => {
    const audio = req;
    const file = await audioService.saveAudioToMemory(audio);
    const downloadURL = await audioService.UploadAudioToFirestoreDB(file);
    const newAudio = await audioService.UploadAudioToDB(req, file, downloadURL);

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

module.exports = { uploadAudio, getAllAudioFiles, getUserAudioFiles, }