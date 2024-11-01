const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const {uploadImage, getAllImages, getUserImages, getImagesByGallery, matchImage, uploadAvatar, updateImage, deleteImage} = require('../controllers/image.controller');

const multer = require('multer');

// Multer configuration for handling file and text fields
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
}).single('file');
//************************************************************************************************************************************************

router.get('/user/all', extractToken, getUserImages)

router.get('/gallery/all', extractToken, getImagesByGallery)

router.get('/get-all', extractToken,  getAllImages)

router.post('/upload', extractToken, upload, uploadImage)

router.post('/upload/match', extractToken, matchImage)

router.post('/upload/avatar', extractToken, upload, uploadAvatar)

router.put('/update', extractToken, updateImage)

router.delete('/destroy', extractToken, deleteImage)

//***********************************************************************************************************************************************

module.exports = router