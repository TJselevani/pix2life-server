const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const { uploadAudio, getAllAudioFiles, getUserAudioFiles, updateAudio, deleteAudio} = require('../controllers/audio.controller');

//************************************************************************************************************************************************

router.get('/user/all', extractToken, getUserAudioFiles)

router.get('/get-all', extractToken,  getAllAudioFiles)

router.post('/upload', extractToken, uploadAudio)

router.put('/update', extractToken, updateAudio)

router.delete('/destroy', extractToken, deleteAudio)

//***********************************************************************************************************************************************

module.exports = router