const ip = require('ip');
const config = {
    postgres: {
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      host: process.env.PG_HOST,
      dialect: process.env.PG_DIALECT,
      port: process.env.PG_PORT
    },
    mysql: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST ||  ip.address(),
      dialect: process.env.DB_DIALECT,
      port: process.env.DB_PORT
    },
    test: {
      username: process.env.PG_USER || process.env.DB_USER,
      password: process.env.PG_PASSWORD || process.env.DB_PASSWORD,
      database: process.env.PG_DB_NAME || process.env.PROD_DB_NAME,
      host: process.env.PG_HOST || process.env.DB_HOST || ip.address(),
      dialect: process.env.PG_DIALECT || process.env.DB_DIALECT,
    },
  };
  
  
  module.exports = config;
  