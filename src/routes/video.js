const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const { uploadVideo, getAllVideos, getUserVideos} = require('../controllers/video.controller');

//************************************************************************************************************************************************

router.post('/upload', extractToken, uploadVideo)

router.get('/user/all', extractToken, getUserVideos)

router.get('/videos', extractToken,  getAllVideos)

//***********************************************************************************************************************************************

module.exports = router