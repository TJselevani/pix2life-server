const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('../../loggers/logger');

const env = process.env.NODE_ENV !== "development" ? "mysql" : "postgres";
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`No database configuration found for environment: ${env}`);
}
logger.debug(dbConfig.database);
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect || "mysql",
    logging: false, // Set to console.log to see SQL queries
    port: dbConfig.port
  }
);

module.exports = sequelize;