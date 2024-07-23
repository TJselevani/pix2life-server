const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');


// Create an Express App
const app = express();

const errorHandler = require('./errors/error-handler');
const logger = require('./loggers/logger');

// Enable CORS for all routes
app.use(cors());

// Middleware to parse request bodies
app.use(express.json()); // Parse JSON request bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

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
  logger.info(`method: ${req.method}, path: ${req.path}`);
  next();
});

// Bundled Routes
const userRoute = require('./routes/user');
const storageRoute = require('./routes/storage');
const imageRoute = require('./routes/image');
const audioRoute = require('./routes/audio');
const videoRoute = require('./routes/video');
const paymentRoute = require('./routes/payment');

// Request Endpoints
app.use('/api/user', userRoute);
app.use('/api/storage', storageRoute);
app.use('/api/image', imageRoute);
app.use('/api/audio', audioRoute);
app.use('/api/video', videoRoute);
app.use('/api/payment', paymentRoute);

// Webhook Endpoints
app.post('/webhook', (req, res) => {
  if (req.file) {
    console.log(`File Uploaded: ${req.file.originalname}`);
  }else if(req.body.file) {
    console.log(`File Uploaded: ${req.body.file.originalname}`);
  } else {
    console.log('No file uploaded');
  }

  // Create a simplified version of the request object
  const simplifiedReq = {
    method: req.method, 
    path: req.path,
    headers: req.headers,
    body: req.body,
    file: req.file,
    query: req.query,
    params: req.params,
  };

  res.status(201).json(simplifiedReq);
});


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
