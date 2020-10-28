const nodemailer = require("nodemailer");
const config = require("../utils/config");

const mailer = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5c9458721a5c8f",
    pass: "8b4f30425e75ea",
  },
});

const sendPasswordResetEmail = (email, token) => {
  const sitename = config.SITENAME;
  const resetPasswordLink = `${sitename}/api/reset-password/verify?email=${email}&token=${token}`;

  mailer.sendMail(
    {
      to: email,
      from: config.FROM_EMAIL,
      subject: `Password Reset | ${sitename}`,
      html: `<h1>Password Reset</h1>
           <p>Hello, you\'ve requested a password reset.</p>
           <p><a href="${resetPasswordLink}">Click here to reset your password</a>, if you did not make this request please disregard the email.</p>`,
    },
    (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: " + info.message);
        transport.close();
      }
    }
  );
};

module.exports = {
  sendPasswordResetEmail,
};
