const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const fs = require('fs');
require('dotenv').config();


// Create an Express App
const app = express();

const errorHandler = require('./errors/error-handler');
const logger = require('./loggers/logger');
const morganMiddleware = require('./middleware/morgan.middleware');

// Enable CORS for all routes
app.use(cors());

// Middleware to parse request bodies
app.use(express.json()); // Parse JSON request bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Compress all responses
app.use(compression());

// Use morgan middleware
// app.use(morgan('dev'));
app.use(morganMiddleware);

// Middleware for serving static files
app.use(express.static('public'));

// Ensure uploads directory exists
const uploadDir = './uploads'; // Change this path as needed
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`method: ${req.method}, path: ${req.path}, Query: ${req.query}`);
  next();
});

// Bundled Routes
const userRoute = require('./routes/user');
const imageRoute = require('./routes/image');
const audioRoute = require('./routes/audio');
const videoRoute = require('./routes/video');
const paymentRoute = require('./routes/payment');
const webhookRoute = require('./routes/webhook');

// Request Endpoints
app.use('/api/v2/user', userRoute);
app.use('/api/v2/image', imageRoute);
app.use('/api/v2/audio', audioRoute);
app.use('/api/v2/video', videoRoute);
app.use('/api/v2/payment', paymentRoute);
app.use('/webhook', webhookRoute);

// Catch-all Route for 404 Not Found
app.use('/', (req, res) => {
  res.status(404).json({ message: 'Welcome to PIX@LIFE' });
});

// Catch-all Route for 404 Not Found
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Status 404, not found' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
