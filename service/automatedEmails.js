require("dotenv").config();


const transporter = require("../smtpTransport");

const sendWelcome = async (userEmail) => {
  const info = await transporter.sendMail({
    from: `"Stick It" <${process.env.EMAIL_ADDRESS}>`,
    to: userEmail,
    subject: "Welcome",
    template:"welcome",
  });

  console.log("Message sent: %s", info.messageId);
};

const sendResetToken = async (userEmail, token) => {
  const info = await transporter.sendMail({
    from: `"Stick It" <${process.env.EMAIL_ADDRESS}>`,
    to: userEmail,
    subject: "Password Reset",
    template: "reset-token",
    context: {
      userEmail,
      token,
    },
  });

  console.log("Message sent: %s", info.messageId);
};

const sendResetConfirmation = async (userEmail) => {
    const info = await transporter.sendMail({
      from: `"Stick It" <${process.env.EMAIL_ADDRESS}>`,
      to: userEmail,
      subject: "Password Confirmation",
      template: "reset-confirmation",
      context: {
        userEmail,
      },
    });
  
    console.log("Message sent: %s", info.messageId);
  };

module.exports = { sendWelcome, sendResetToken, sendResetConfirmation };
