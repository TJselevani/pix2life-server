const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require('../loggers/logger');
const {
  BadRequestError,
  NotFoundError,
} = require('../errors/application-errors');
const videoService = require('../services/media/video.service');
const FileStorage = require('../util/clean-up-file');
const CloudinaryService = require('../services/storage/cloudinary.service');

const uploadVideo = asyncHandler(async (req, res) => {
  const file = req.file;
  const videoPath = req.file.path;
  const userId = req.user.id;
  const galleryName = req.query.galleryName;

  if (!file) {
    throw new BadRequestError('Video File not found/supported');
  }

  if (!galleryName) {
    throw new BadRequestError('No Gallery Specified');
  }

  const folder = `videos/${userId}/collection`;
  const { downloadURL, publicId } = await CloudinaryService.uploadFile(
    videoPath,
    folder
  );

  const newVideo = await videoService.UploadVideoToDB(
    userId,
    file,
    downloadURL,
    publicId,
    galleryName
  );

  if (newVideo) {
    // await saveImageMetaDataDB(file);
    logger.debug(`Successfully created file: ${file.originalname}`);
    res
      .status(201)
      .json({ message: `Successfully uploaded file: ${file.originalname}` });
  } else {
    throw new BadRequestError('File could not be uploaded, try again');
  }

  //delete the file from disk if no longer needed
  await FileStorage.cleanupFile(videoPath);
});

const getAllVideos = asyncHandler(async (req, res) => {
  const images = await videoService.getAllVideos();
  res.json(images);
});

const getUserVideos = asyncHandler(async (req, res) => {
  const user = req.user;
  const images = await videoService.getAllUserVideos(user);
  res.json(images);
});

const getVideosByGallery = asyncHandler(async (req, res) => {
  const user = req.user;
  const galleryName = req.query.galleryName;
  const images = await videoService.getVideosByGallery(user, galleryName);
  res.json(images);
});

const updateVideo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { videoId } = req.query;
  const newFilename = req.body.filename;
  const newDescription = req.body.description;

  if (videoId == undefined || videoId == null) {
    throw new NotFoundError('Resource ID missing');
  }

  const updatedVideo = await videoService.updateVideoDetails(
    videoId,
    userId,
    newFilename,
    newDescription
  );
  res.json({
    message: 'Video updated successfully',
    updatedVideo: updatedVideo,
  });
});

const deleteVideo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { videoId } = req.query;

  if (videoId == undefined || videoId == null) {
    throw new NotFoundError('Resource ID missing');
  }

  const response = await videoService.deleteVideo(videoId, userId);
  res.json(response);
});

module.exports = {
  uploadVideo,
  getAllVideos,
  getUserVideos,
  getVideosByGallery,
  updateVideo,
  deleteVideo,
};
