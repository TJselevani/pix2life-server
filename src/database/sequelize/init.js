// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('pix2life', 'root', '', { //database, username, password
  host: 'localhost',
  dialect: 'mysql', // Change to 'mysql', 'sqlite', 'mariadb', etc., if needed
  logging: false,
  port: 3307
});

module.exports = sequelize;
