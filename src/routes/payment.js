const express = require('express');
const router = express.Router()
const extractToken = require('../middleware/extract-token.middleware');
const { initiatePayment, makePayment, cancelPayment } = require('../controllers/paypal.controller');
const { createStripePayment} = require('../controllers/stripe.controller');

//************************************************************************************************************************************************

router.post('/paypal/pay', extractToken, initiatePayment)

router.get('/paypal/success', extractToken, makePayment)

router.get('/paypal/cancel', extractToken, cancelPayment)

router.post('/stripe/create-payment-intent', extractToken, createStripePayment)

//***********************************************************************************************************************************************

module.exports = router