const dotenv = require('dotenv');
const ip = require('ip');
// const memwatch = require('memwatch-next');

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

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;

//start Server running on port
const serve = () =>
  app.listen(PORT, () => {
    logger.info(`🌏 Express server started at ${ip.address()}:${PORT}`);
  });
serve();

setInterval(() => {
  // eslint-disable-next-line no-undef
  const memoryUsage = process.memoryUsage();
  const formattedOutput = formatMemoryUsage(memoryUsage);
  logger.debug(formattedOutput);
}, 10000);

//connect sequelize
const syncDatabase = require('./database/sequelize/sync');
syncDatabase();

//connect firebase
// const { initializeFirebaseAdmin, initializeFirebaseApp, initializeFirebaseStorage } = require('./database/firebase/init');

// Connect to Cloudinary Storage
const { initCloudinary } = require('./database/cloudinary/init');
const { formatMemoryUsage } = require('./util/memory-tracking');
initCloudinary();

// memory leaks logger
// memwatch.on('leak', (info) => {
//   logger.error(`Memory leak detected:', ${JSON.stringify(info, null, 2)}`);
// });

// Close the Mongoose connection when receiving SIGINT
// eslint-disable-next-line no-undef
process.on('SIGINT', async () => {
  console.log('\n');
  logger.info('Gracefully shutting down');
  // eslint-disable-next-line no-undef
  process.exit(0);
});
