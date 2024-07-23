const mediaService = require("../services/storage/storage.service");
const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError } = require("../errors/application-errors");


const uploadImage = asyncHandler(async (req, res,) => {
    // logger.info(`Request body: ${JSON.stringify(req.body)}`);
    const image = req;

    if (!image) {
        throw new BadRequestError('No file selected to upload');
    }
    const file = await mediaService.uploadImage(image);

    if (file) {
        await mediaService.saveImageMetaData(file, req);
        logger.info( `Successfully uploaded file: ${file.filename}`);
        res.status(201).json({ message: `Successfully uploaded file: ${file.filename}` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }
    
});

const getAllImages = asyncHandler(async (req, res, next) => {
    const images = await mediaService.getAllImages();
    res.json(images);
});

const getUserImages = asyncHandler(async (req, res, next) => {
    const id = req.user.id
    const images = await mediaService.getAllImages(id);
    res.json(images);
});

module.exports = { uploadImage, getAllImages, getUserImages }