const transporter = require("../nodemailerTransporter");

const sendResetToken = async (userEmail) => {
    const info = await transporter.sendMail({
        from: '"Stick It" <bruno200710@hotmail.com>',
        to: userEmail,
        subject: "Reset Password Verification Code",
        html: '<h1>Password Reset Code</h1>'
    })
}