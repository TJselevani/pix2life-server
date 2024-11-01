// const { getAllImagesByUserDB, getAllImagesDB, saveImageMetaDataDB, uploadImageDB } = require("../services/media/image.service");
const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError, NotFoundError } = require("../errors/application-errors");
const imageService = require("../services/media/image.service");
const userService = require('../services/user.service');
const tensorflow = require('../services/matching/tensorFlow');


const uploadImage = asyncHandler(async (req, res, next) => {
    const image = req;
    const userId = req.user.id;
    const galleryName = req.query.galleryName;
    if(!galleryName){
        throw new BadRequestError('No Gallery Specified'); 
    }

    const file = await imageService.saveImageToMemory(image);
    const { downloadURL, path }  = await imageService.UploadImageToFirestoreDB(file, userId);
    const newImage = await imageService.UploadImageToDB(req, file, downloadURL, path, galleryName);

    if (newImage) {
        // await saveImageMetaDataDB(file);
        logger.info( `Successfully created file: ${file.originalname}`);
        res.status(201).json({ message: `Successfully uploaded file: ${file.originalname}` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }
});

const uploadAvatar = asyncHandler(async (req, res, next) => {
    const image = req;
    const userId = req.user.id;
    const file = await imageService.saveImageToMemory(image);
    const { downloadURL }  = await imageService.UploadImageToFirestoreDB(file);
    const newAvatar = await userService.updateUserAvatar(userId, downloadURL)

    if (newAvatar) {
        logger.info( `Successfully created file: ${file.originalname}`);
        res.status(201).json({ message: `Successfully uploaded Avatar` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }
});

const matchImage = asyncHandler(async (req, res, next) => {
    const image = req;
    const user = req.user;

    const file = await imageService.saveImageToStorage(image);
    const imagePath = file.path;

    const features = await tensorflow.extractStoredImageFeatures(imagePath);
    const images = await imageService.getAllUserImagesWithFeatures(user);

    if (!images) {
        throw new BadRequestError('No matching images found');
    }

    const match = await tensorflow.findMatchingImage(features, images);

    await imageService.deleteImageFromStorage(imagePath);

    if (!match) {
        throw new BadRequestError('No matching image found');
    }

    logger.info(`match retrieved: ${match}`);
    res.json({ message: `Matching image, ${match.filename }`, image: match });
});

const getAllImages = asyncHandler(async (req, res, next) => {
    const images = await imageService.getAllImages();
    res.json(images);
});

const getUserImages = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const images = await imageService.getAllUserImages(user);
    res.json(images);
});

const getImagesByGallery = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const galleryName = req.query.galleryName;
    const images = await imageService.getImagesByGallery(user, galleryName);
    res.json(images);
});

const updateImage = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { imageId } = req.query;
    const newFilename = req.body.filename
    const newDescription = req.body.description

    if(imageId == undefined || imageId == null){
        throw new NotFoundError('Resource ID missing')
    }
    
    const updatedImage = await imageService.updateImageDetails(imageId, userId, newFilename, newDescription);
    res.json({ message: 'Image updated successfully', updatedImage: updatedImage });
}); 

const deleteImage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageId } = req.query;

    if(imageId == undefined || imageId == null){
        throw new NotFoundError('Resource ID missing')
    }
    
    const response = await imageService.deleteImage(imageId, userId);
    res.json({ message: 'Image deleted successfully' });
});    

module.exports = { uploadImage, getAllImages, getUserImages, getImagesByGallery, uploadAvatar, matchImage, updateImage, deleteImage }