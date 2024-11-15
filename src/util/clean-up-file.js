const fs = require('fs');
const util = require('util');
const logger = require('../loggers/logger');
const unlinkAsync = util.promisify(fs.unlink);

class FileStorage{
    static cleanupFile = async (filePath) =>  {
        try {
            await unlinkAsync(filePath);
            logger.debug(`File Cleanup: ${filePath}`);
        } catch (error) {
            logger.error(`Error deleting file: ${error.message}`);
        }
    };
}



module.exports = FileStorage;