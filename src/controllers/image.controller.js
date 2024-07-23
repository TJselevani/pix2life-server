const { getAllImagesByUserDB, getAllImagesDB, saveImageMetaDataDB, uploadImageDB } = require("../services/media/image.service");
const asyncHandler = require('../middleware/async-handler.middleware');
const logger = require("../loggers/logger");
const { BadRequestError } = require("../errors/application-errors");
const imageService = require("../services/media/image.service");


const uploadImage = asyncHandler(async (req, res,) => {
    const image = req;
    const file = await imageService.saveImageToMemory(image);
    const downloadURL = await imageService.UploadImageToFirestoreDB(file);
    const newImage = await imageService.UploadImageToDB(req, file, downloadURL);

    if (newImage) {
        // await saveImageMetaDataDB(file);
        logger.info( `Successfully created file: ${file.originalname}`);
        res.status(201).json({ message: `Successfully uploaded file: ${file.originalname}` });
    } else {
        throw new BadRequestError('File could not be uploaded, try again');
    }
});

const matchImage = asyncHandler(async (req, res,) => {
    const userId = req.user.id;
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

module.exports = { uploadImage, getAllImages, getUserImages, }