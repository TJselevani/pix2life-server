const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const {uploadImage, getAllImages, getUserImages} = require('../controllers/image.controller');

//************************************************************************************************************************************************

router.post('/upload', extractToken, uploadImage)

router.get('/user/all', extractToken, getUserImages)

router.get('/images', extractToken,  getAllImages)

//***********************************************************************************************************************************************

module.exports = router