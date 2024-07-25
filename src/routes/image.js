const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const {uploadImage, getAllImages, getUserImages, updateImage, deleteImage} = require('../controllers/image.controller');

//************************************************************************************************************************************************

router.get('/user/all', extractToken, getUserImages)

router.get('/get-all', extractToken,  getAllImages)

router.post('/upload', extractToken, uploadImage)

router.put('/update', extractToken, updateImage)

router.delete('/destroy', extractToken, deleteImage)

//***********************************************************************************************************************************************

module.exports = router