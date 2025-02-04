const multer = require('multer');

// Multer configuration for handling file and text fields
const storage = multer.memoryStorage();

const extractReqFileToMemory = multer({
  storage: storage,
}).single('file');

module.exports = extractReqFileToMemory();