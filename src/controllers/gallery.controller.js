const { BadRequestError } = require('../errors/application-errors');
const logger = require('../loggers/logger');
const galleryService = require('../services/media/gallery.service');
const imageService = require('../services/media/image.service');
const asyncHandler = require('../middleware/async-handler.middleware');
const multer = require('multer');

const createGallery = asyncHandler(async (req, res, next) => {
    // Accessing the file uploaded via Multer
    const imageFile = req.file;
  
    // Accessing other form fields
    const galleryName = req.body.galleryName;
    const description = req.body.description;
  
    if (!galleryName || !description) {
      throw new BadRequestError('Gallery Name or Description is missing');
    }
  
    const userId = req.user.id;
  
    logger.info(`Gallery Name: ${galleryName}`);
  
    const file = await imageService.saveImageToMemory(req);
  
    const { downloadURL } = await imageService.UploadImageToFirestoreDB(file, userId);
  
    const existingGallery = await galleryService.findOne(galleryName, userId);
  
    if (existingGallery) {
      throw new BadRequestError('Gallery already exists');
    }
  
    await galleryService.createNewGallery(userId, galleryName, description, downloadURL);
  
    res.status(201).json({ message: 'Successfully Created Gallery' });
  });
  

const findGallery = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const gallery = await galleryService.findAll(userId);
    res.status(200).json({ message: 'Successfully retrieved Gallery', gallery: gallery });
})

const updateGallery = asyncHandler(async (req, res, next)  => {
    const image = req;
    const userId = req.user.id;
    const { galleryName, newName, newDescription }  = req.body;
    const file = await imageService.saveImageToMemory(image);
    const { downloadURL, path }  = await imageService.UploadImageToFirestoreDB(file, userId);
    const gallery = await galleryService.updateGallery(userId, galleryName, newName, newDescription, downloadURL);
    res.status(201).json({ message: 'Successfully Updated Gallery' });
})

const deleteGallery = asyncHandler(async (req, res, next)  => {
    
})

module.exports = { createGallery, updateGallery, findGallery, deleteGallery }