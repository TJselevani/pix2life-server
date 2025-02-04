// const { getAllImagesByUserDB, getAllImagesDB, saveImageMetaDataDB, uploadImageDB } = require("../services/media/image.service");
const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require('../loggers/logger');
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} = require('../errors/application-errors');
const imageService = require('../services/media/image.service');
const userService = require('../services/user.service');
const tensorflow = require('../services/matching/tensorFlow');
const FileStorage = require('../util/clean-up-file');
const CloudinaryService = require('../services/storage/cloudinary.service');

const uploadImage = asyncHandler(async (req, res) => {
  const file = req.file;
  const imagePath = req.file.path;
  const userId = req.user.id;
  const galleryName = req.query.galleryName;

  if (!file) {
    throw new BadRequestError('File not found/supported');
  }

  if (!galleryName) {
    throw new BadRequestError('No Gallery Specified');
  }

  const folder = `images/${userId}/collection/`;
  const { downloadURL, publicId } = await CloudinaryService.uploadFile(
    imagePath,
    folder
  );

  const model = await tensorflow.checkModel();

  let features;
  if (model) {
    features = await tensorflow.extractFeatures(downloadURL);
  }

  const newImage = await imageService.UploadImageToDB(
    userId,
    file,
    downloadURL,
    publicId,
    galleryName,
    features
  );

  if (newImage) {
    // await saveImageMetaDataDB(file);
    logger.debug(`Successfully created file: ${file.originalname}`);
    res
      .status(201)
      .json({ message: `Successfully uploaded file: ${file.originalname}` });
  } else {
    throw new BadRequestError('File could not be uploaded, try again');
  }

  //delete the file from disk if no longer needed
  await FileStorage.cleanupFile(imagePath);
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const file = req.file;
  const imagePath = req.file.path;
  const userId = req.user.id;

  if (!file) {
    throw new BadRequestError('File not found/supported');
  }

  const folder = `images/${userId}/avatar/`;
  const { downloadURL } = await CloudinaryService.uploadFile(imagePath, folder);
  const newAvatar = await userService.updateUserAvatar(userId, downloadURL);

  if (newAvatar) {
    logger.debug(`Successfully created file: ${file.originalname}`);
    res.status(201).json({ message: `Successfully uploaded Avatar` });
  } else {
    throw new InternalServerError('File could not be uploaded, try again');
  }

  await FileStorage.cleanupFile(imagePath);
});

const matchImage = asyncHandler(async (req, res) => {
  const file = req.file;
  const filePath = req.file.path;
  const user = req.user;

  if (!file) {
    throw new BadRequestError('File not found/supported');
  }

  const model = await tensorflow.checkModel();

  if (!model) {
    throw new NotFoundError('Service unavailable');
  }

  const features = await tensorflow.extractStoredImageFeatures(filePath);
  const images = await imageService.getAllUserImagesWithFeatures(user);

  if (!images) {
    throw new BadRequestError('No matching images found');
  }

  const match = await tensorflow.findMatchingImage(features, images);

  //delete the file from disk if no longer needed
  await FileStorage.cleanupFile(filePath);

  if (!match) {
    throw new BadRequestError('No matching image found');
  }

  logger.debug(`match retrieved: ${match}`);
  res.json({ message: `Matching image, ${match.filename}`, image: match });
});

const getAllImages = asyncHandler(async (req, res) => {
  const images = await imageService.getAllImages();
  res.json(images);
});

const getUserImages = asyncHandler(async (req, res) => {
  const user = req.user;
  const images = await imageService.getAllUserImages(user);
  res.json(images);
});

const getImagesByGallery = asyncHandler(async (req, res) => {
  const user = req.user;
  const galleryName = req.query.galleryName;
  const images = await imageService.getImagesByGallery(user, galleryName);
  res.json(images);
});

const updateImage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { imageId } = req.query;
  const newFilename = req.body.filename;
  const newDescription = req.body.description;

  if (imageId == undefined || imageId == null) {
    throw new NotFoundError('Resource ID missing');
  }

  const updatedImage = await imageService.updateImageDetails(
    imageId,
    userId,
    newFilename,
    newDescription
  );
  res.json({
    message: 'Image updated successfully',
    updatedImage: updatedImage,
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { imageId } = req.query;

  if (imageId == undefined || imageId == null) {
    throw new NotFoundError('Resource ID missing');
  }

  await imageService.deleteImage(imageId, userId);
  res.json({ message: 'Image deleted successfully' });
});

module.exports = {
  uploadImage,
  getAllImages,
  getUserImages,
  getImagesByGallery,
  uploadAvatar,
  matchImage,
  updateImage,
  deleteImage,
};
