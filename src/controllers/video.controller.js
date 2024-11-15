const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError } = require("../errors/application-errors");
const videoService = require("../services/media/videos.services");
const FileStorage = require('../util/clean-up-file');


const uploadVideo = asyncHandler(async (req, res,) => {
    const file = req.file;
    const userId = req.user.id;
    const galleryName = req.query.galleryName;

    if (!file) {
        throw new BadRequestError('Video File not found/supported');
    }

    if(!galleryName){
        throw new BadRequestError('No Gallery Specified'); 
    }

    // const file = await videoService.saveVideoToMemory(video);
    const { downloadURL, path } = await videoService.UploadVideoToFirestoreDB(file, userId);
    const newVideo = await videoService.UploadVideoToDB(req, file, downloadURL, path, galleryName);

    if (newVideo) {
        // await saveImageMetaDataDB(file);
        logger.info( `Successfully created file: ${file.originalname}`);
        res.status(201).json({ message: `Successfully uploaded file: ${file.originalname}` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }

     //delete the file from disk if no longer needed
     await FileStorage.cleanupFile(file.path);
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

const getVideosByGallery = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const galleryName = req.query.galleryName;
    const images = await videoService.getVideosByGallery(user, galleryName);
    res.json(images);
});

const updateVideo = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { videoId } = req.query;
    const newFilename = req.body.filename
    const newDescription = req.body.description

    if(videoId == undefined || videoId == null){
        throw new NotFoundError('Resource ID missing')
    }

    const updatedVideo = await videoService.updateVideoDetails(videoId, userId, newFilename, newDescription);
    res.json({ message: 'Video updated successfully', updatedVideo: updatedVideo });
    
}); 

const deleteVideo = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { videoId } = req.query;

    if(videoId == undefined || videoId == null){
        throw new NotFoundError('Resource ID missing')
    }

    const response = await videoService.deleteVideo(videoId, userId);
    res.json(response);
});  

module.exports = { uploadVideo, getAllVideos, getUserVideos, getVideosByGallery, updateVideo, deleteVideo }