const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const { uploadAudio, getAllAudioFiles, getUserAudioFiles, getAudioFilesByGallery, updateAudio, deleteAudio} = require('../controllers/audio.controller');
const extractReqFileToStorage = require('../util/extract-req-file-to-storage');

//************************************************************************************************************************************************

router.get('/user/all', extractToken, getUserAudioFiles)

router.get('/get-all', extractToken,  getAllAudioFiles)

router.get('/gallery/all', extractToken,  getAudioFilesByGallery)

router.post('/upload', extractToken, extractReqFileToStorage, uploadAudio)

router.put('/update', extractToken, updateAudio)

router.delete('/destroy', extractToken, deleteAudio)

//***********************************************************************************************************************************************

module.exports = router