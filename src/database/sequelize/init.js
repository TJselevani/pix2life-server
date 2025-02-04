const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('../../loggers/logger');

// Determine the environment based on NODE_ENV, default to 'development'
  // eslint-disable-next-line no-undef
const environment = process.env.NODE_ENV || 'development'; // Default to 'development' if NODE_ENV is not set

const env = environment === 'production' ? 'production' : 'development'; // Use 'postgres' for production, 'mysql' for development

const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`No database configuration found for environment: ${env}`);
}

logger.debug(`Connecting to the ${env} database ${dbConfig.database}`);

let sequelize;

// logger.debug(`NAME: ${dbConfig.username}, PASS ${dbConfig.password}, `)

if (environment === 'production') {
  // Use DATABASE_URL for production
  // eslint-disable-next-line no-undef
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    // dialect: dbConfig.dialect,
    // host: dbConfig.host,
    // username: dbConfig.username,
    // password: dbConfig.password,
    // database: dbConfig.database,
    port: dbConfig.port,
    dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          }
        },
    logging: false,
  });
} else {
  // Use config options for development
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
