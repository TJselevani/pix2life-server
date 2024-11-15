const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const {uploadImage, getAllImages, getUserImages, getImagesByGallery, matchImage, uploadAvatar, updateImage, deleteImage} = require('../controllers/image.controller');
const extractReqFileToStorage = require('../util/extract-req-file-to-storage');

//************************************************************************************************************************************************

router.get('/user/all', extractToken, getUserImages)

router.get('/gallery/all', extractToken, getImagesByGallery)

router.get('/get-all', extractToken,  getAllImages)

router.post('/upload', extractToken, extractReqFileToStorage, uploadImage)

router.post('/upload/match', extractToken, extractReqFileToStorage, matchImage)

router.post('/upload/avatar', extractToken, extractReqFileToStorage, uploadAvatar)

router.put('/update', extractToken, updateImage)

router.delete('/destroy', extractToken, deleteImage)

//***********************************************************************************************************************************************

module.exports = router