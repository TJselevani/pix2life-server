const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const {createGallery, updateGallery, deleteGallery, findGallery}  = require('../controllers/gallery.controller');

const multer = require('multer');

// Multer configuration for handling file and text fields
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
}).single('image');


//************************************************************************************************************************************************

router.get('/get', extractToken, findGallery)

router.post('/create', extractToken, upload, createGallery)

router.put('/update', extractToken, updateGallery)

router.delete('/destroy', extractToken, deleteGallery)

//***********************************************************************************************************************************************

module.exports = router