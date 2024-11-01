const ip = require('ip');
const config = {
    production: {
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB_NAME,
      host: process.env.PG_HOST,
      dialect: 'postgres',
      port: 5432
    },
    development: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: 5432
    },
  };
  
  module.exports = config;
  