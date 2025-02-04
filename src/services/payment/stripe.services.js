const dotenv = require('dotenv');
const logger = require('../../loggers/logger');
const { InternalServerError } = require('../../errors/application-errors');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const stripe = require('stripe')(process.env.STRIPE_SECRET);

class StripeService{
  static createPaymentIntent = async (amount) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card'],
      });

      return {
        clientSecret: paymentIntent.client_secret,
      }
    } catch (error) {
      logger.error(error);
      throw new InternalServerError('Could not complete payment!')
    }
  };
}

module.exports = StripeService;
