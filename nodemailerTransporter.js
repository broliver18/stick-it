if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: smtp - mail.outlook.com,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;
