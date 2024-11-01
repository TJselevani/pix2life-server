const stripeService  = require('../services/payment/stripe.services');

const createStripePayment = async (req, res) => {
    const { amount, currency } = req.body; // (in cents, multiply by 100 to achieve usd)
    const response = await stripeService.createPaymentIntent(amount);
    res.send(response);
}

module.exports = { createStripePayment };