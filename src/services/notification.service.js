const nodemailer = require('nodemailer');
const logger = require('../loggers/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_PROVIDER, // Replace with your email provider
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS  // Your email password
            }
        });
    }

    async sendEmail(to, subject, text, html) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.debug(`Email sent: ${info.response}`);
        } catch (error) {
            logger.error(`Error sending email: ${error}`);
        }
    }
}

module.exports = new EmailService();
