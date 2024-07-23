const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const {uploadImage, getAllImages, getUserImages} = require('../controllers/storage.controller')

//************************************************************************************************************************************************

router.post('/image/upload', extractToken, uploadImage)

router.get('/image/images', extractToken, getAllImages)

router.get('/image/images', extractToken, getUserImages)


//***********************************************************************************************************************************************

module.exports = router