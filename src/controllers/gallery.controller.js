const { BadRequestError } = require('../errors/application-errors');
const logger = require('../loggers/logger');
const galleryService = require('../services/media/gallery.service');
const asyncHandler = require('../middleware/async-handler.middleware');
const FileStorage = require('../util/clean-up-file');
const CloudinaryService = require('../services/storage/cloudinary.service');

const createGallery = asyncHandler(async (req, res) => {
  // Accessing the file uploaded via Multer
  const file = req.file;
  const imagePath = req.file.path;
  const userId = req.user.id;
  // Accessing other form fields
  const galleryName = req.body.galleryName;
  const description = req.body.description;

  if (!file) {
    throw new BadRequestError('Image File not found/supported');
  }

  if (!galleryName || !description) {
    throw new BadRequestError('Gallery Name or Description is missing');
  }

  const folder = `images/${userId}/gallery`;
  const { downloadURL } = await CloudinaryService.uploadFile(imagePath, folder);

  logger.debug(`Gallery Name: ${galleryName}`);

  const existingGallery = await galleryService.findOne(galleryName, userId);

  if (existingGallery) {
    throw new BadRequestError('Gallery already exists');
  }

  await galleryService.createNewGallery(
    userId,
    galleryName,
    description,
    downloadURL
  );

  //delete the file from disk if no longer needed
  await FileStorage.cleanupFile(file.path);

  res.status(201).json({ message: 'Successfully Created Gallery' });
});

const findGallery = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const gallery = await galleryService.findAll(userId);
  res
    .status(200)
    .json({ message: 'Successfully retrieved Gallery', gallery: gallery });
});

const updateGallery = asyncHandler(async (req, res) => {
  const imagePath = req.file.path;
  const userId = req.user.id;
  const { galleryName, newName, newDescription } = req.body;
  const folder = `images/${userId}/gallery/`;
  const { downloadURL } = await CloudinaryService.uploadFile(imagePath, folder);

  await galleryService.updateGallery(
    userId,
    galleryName,
    newName,
    newDescription,
    downloadURL
  );
  res.status(201).json({ message: 'Successfully Updated Gallery' });
});

const deleteGallery = asyncHandler(async () => {});

module.exports = { createGallery, updateGallery, findGallery, deleteGallery };
