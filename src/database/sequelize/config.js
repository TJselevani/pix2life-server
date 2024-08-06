const ip = require('ip');
const config = {
    postgres: {
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      host: ip.address() || process.env.PG_HOST,
      dialect: process.env.PG_DIALECT,
      port: process.env.PG_PORT
    },
    mysql: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      host: ip.address() || process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      port: process.env.DB_PORT
    },
    info: {
      username: process.env.PG_USER || process.env.DB_USER,
      password: process.env.PG_PASSWORD || process.env.DB_PASSWORD,
      database: process.env.PG_DB_NAME || process.env.PROD_DB_NAME,
      host: ip.address() || process.env.PG_HOST || process.env.DB_HOST,
      dialect: process.env.PG_DIALECT || process.env.DB_DIALECT,
    },
  };
  
  
  module.exports = config;
  