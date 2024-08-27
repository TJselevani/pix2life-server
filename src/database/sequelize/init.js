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
  const databaseUrl = process.env.INTERNAL_URL;
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // or true, depending on your setup
      },
      connectTimeout: 30000 // Increase timeout to 30 seconds
    },
    pool: {
      max: 5, // Maximum number of connections in the pool
      min: 0, // Minimum number of connections in the pool
      acquire: 30000, // Maximum time in milliseconds to acquire a connection
      idle: 10000 // Maximum time in milliseconds that a connection can be idle before being released
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
      logging: false, // Set to console.log to see SQL queries
      port: dbConfig.port,
      pool: {
        max: 5, // Maximum number of connections in the pool
        min: 0, // Minimum number of connections in the pool
        acquire: 30000, // Maximum time in milliseconds to acquire a connection
        idle: 10000 // Maximum time in milliseconds that a connection can be idle before being released
      }
    }
  );
}

module.exports = sequelize;
