const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const {createGallery, updateGallery, deleteGallery, findGallery}  = require('../controllers/gallery.controller');
const extractReqFileToStorage = require('../util/extract-req-file-to-storage');

//************************************************************************************************************************************************

router.get('/get', extractToken, findGallery)

router.post('/create', extractToken, extractReqFileToStorage, createGallery)

router.put('/update', extractToken, updateGallery)

router.delete('/destroy', extractToken, deleteGallery)

//***********************************************************************************************************************************************

module.exports = router