const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError } = require("../errors/application-errors");
const videoService = require("../services/media/videos.services");


const uploadVideo = asyncHandler(async (req, res,) => {
    const video = req;
    const userId = req.user.id;
    const galleryName = req.query.galleryName;
    if(!galleryName){
        throw new BadRequestError('No Gallery Specified'); 
    }
    const file = await videoService.saveVideoToMemory(video);
    const { downloadURL, path } = await videoService.UploadVideoToFirestoreDB(file, userId);
    const newVideo = await videoService.UploadVideoToDB(req, file, downloadURL, path, galleryName);

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
    const { videoId } = req.params;

    if(videoId == undefined || videoId == null){
        throw new NotFoundError('Resource ID missing')
    }

    const response = await videoService.deleteVideo(videoId, userId);
    res.json(response);
});  

module.exports = { uploadVideo, getAllVideos, getUserVideos, getVideosByGallery, updateVideo, deleteVideo }