const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: '.env.default' });
}
const paypal = require('paypal-rest-sdk');

class PayPalService {
  constructor() {
    paypal.configure({
      mode: 'sandbox', // 'sandbox' or 'live'
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET
    });
  }

  createPayment(amount, currency, returnUrl, cancelUrl) {
    return new Promise((resolve, reject) => {
      const create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": returnUrl,
          "cancel_url": cancelUrl
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": "Subscription",
              "sku": "subscription",
              "price": amount,
              "currency": currency,
              "quantity": 1
            }]
          },
          "amount": {
            "currency": currency,
            "total": amount
          },
          "description": "Subscription payment"
        }]
      };

      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }

  executePayment(payerId, paymentId, amount, currency) {
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
          "amount": {
            "currency": currency,
            "total": amount
          }
        }]
      };

      paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }
}

module.exports = new PayPalService();
