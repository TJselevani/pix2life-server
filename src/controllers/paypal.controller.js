const payPalService = require('../services/payment/paypal.services');

const returnUrl = `${process.env.BASE_URL}/payment/paypal/success`;
const cancelUrl = `${process.env.BASE_URL}/payment/paypal/cancel`;

const initiatePayment = (async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const payment = await payPalService.createPayment(amount, currency, returnUrl, cancelUrl);
    const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
    res.json({ approvalUrl });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

const makePayment = (async (req, res) => {
  const { PayerID: payerId, paymentId } = req.query;
//   const { amount, currency } = req.body;
  const amount = '1.00'; // should match the amount in createPayment
  const currency = 'USD'; // should match the currency in createPayment

  try {
    const payment = await payPalService.executePayment(payerId, paymentId, amount, currency);
    res.send('Payment Successful');
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

const cancelPayment = ( (req, res) => res.send('Payment Cancelled'));

module.exports = { initiatePayment, makePayment, cancelPayment };
