const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const { uploadAudio, getAllAudioFiles, getUserAudioFiles} = require('../controllers/audio.controller');

//************************************************************************************************************************************************

router.post('/upload', extractToken, uploadAudio)

router.get('/user/all', extractToken, getUserAudioFiles)

router.get('/audioFiles', extractToken,  getAllAudioFiles)

//***********************************************************************************************************************************************

module.exports = router