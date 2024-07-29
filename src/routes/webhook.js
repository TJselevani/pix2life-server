const express = require('express');
const logger = require('../loggers/logger');
const router = express.Router()

//************************************************************************************************************************************************

// Webhook Endpoints
router.post('/trace', (req, res) => {
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
    logger.trace(simplifiedReq)
    res.status(201).json(simplifiedReq);
  });

//***********************************************************************************************************************************************

module.exports = router