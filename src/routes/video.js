const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const { uploadVideo, getAllVideos, getUserVideos, updateVideo, deleteVideo} = require('../controllers/video.controller');

//************************************************************************************************************************************************

router.get('/user/all', extractToken, getUserVideos)

router.get('/get-all', extractToken,  getAllVideos)

router.post('/upload', extractToken, uploadVideo)

router.put('/update', extractToken, updateVideo)

router.delete('/destroy', extractToken, deleteVideo)

//***********************************************************************************************************************************************

module.exports = router