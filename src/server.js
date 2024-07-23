const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}

const app = require('./app');

app.set('view options', { pretty: true });
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

const logger = require('./loggers/logger');

const PORT = process.env.PORT || 3000;

//start Server running on port
const serve = () => app.listen(PORT, () => {
  logger.info(`🌏 Express server started at http://localhost:${PORT}`);
});
serve();

//connect sequelize
const syncDatabase = require('./database/sequelize/sync');
syncDatabase();

//connect firebase
const { initializeFirebaseApp, initializeFirebaseStorage } = require('./database/firebase/init');
initializeFirebaseApp();
initializeFirebaseStorage();

// Close the Mongoose connection when receiving SIGINT
process.on('SIGINT', async () => {
  console.log('\n');
  logger.info('Gracefully shutting down');
  process.exit(0);
});
