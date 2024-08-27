const { Sequelize } = require('sequelize');
const url = "postgresql://pix2life_backend_db_user:ejtQawu3rAmcpJPOsyShUQE4P4RcTvyl@dpg-cr6rjt23esus73cktgb0-a.oregon-postgres.render.com/pix2life_backend_db"

const sequelize = new Sequelize(url,
  {
    host: 'cr6rjt23esus73cktgb0-a.oregon-postgres.render.com', //host
    dialect: 'postgres',
    port: 5432,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2' // Adjust based on the supported versions
      },
        connectTimeout: 30000
      }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.message);
  });