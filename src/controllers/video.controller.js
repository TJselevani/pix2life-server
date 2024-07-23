const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError } = require("../errors/application-errors");
const videoService = require("../services/media/videos.services");


const uploadVideo = asyncHandler(async (req, res,) => {
    const video = req;
    const file = await videoService.saveVideoToMemory(video);
    const downloadURL = await videoService.UploadVideoToFirestoreDB(file);
    const newVideo = await videoService.UploadVideoToDB(req, file, downloadURL);

    if (newVideo) {
        // await saveImageMetaDataDB(file);
        logger.info( `Successfully created file: ${file.originalname}`);
        res.status(201).json({ message: `Successfully uploaded file: ${file.originalname}` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }
});

const getAllVideos = asyncHandler(async (req, res, next) => {
    const images = await videoService.getAllVideos();
    res.json(images);
});

const getUserVideos = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const images = await videoService.getAllUserVideos(user);
    res.json(images);
});

module.exports = { uploadVideo, getAllVideos, getUserVideos, }