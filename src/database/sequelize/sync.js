// sync.js
const sequelize = require('./init');
const logger = require('../../loggers/logger');

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('sequelize connection established successfully.');
    await sequelize.sync({ force: true, alter: true }); // Use { force: true } for development to recreate tables
    logger.info('Database synchronized.');
  } catch (error) {
    logger.error(`Unable to connect to the database: ${error}`);
    // logger.error(`stack error: ${error.stack}`);
  }
};

module.exports = syncDatabase;
