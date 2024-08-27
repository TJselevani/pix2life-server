const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('../../loggers/logger');

// Determine the environment based on NODE_ENV, default to 'development'
const env = process.env.NODE_ENV === 'production' ? 'postgres' : 'mysql';

const dbConfig = config[env];

if (!dbConfig && env === 'development') {
  throw new Error(`No database configuration found for environment: ${env}`);
}

logger.debug(`Connecting to the ${env} database.`);

let sequelize;

if (env === 'production') {
  // Use the DATABASE_URL for production
  const databaseUrl = process.env.INTERNAL_DATABASE_URL;
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectTimeout: 30000 
    },
    pool: {
      max: 5, 
      min: 0,
      acquire: 30000,
      idle: 10000 
    }
  });
} else {
  // Use the config options for development
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: false, 
      port: dbConfig.port,
      pool: {
        max: 5,
        min: 0, 
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
