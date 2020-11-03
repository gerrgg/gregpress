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

const sendPasswordResetEmail = async (email, token) => {
  const sitename = config.SITENAME;
  const resetPasswordLink = `${sitename}/api/reset-password/${email}/${token}`;

  const info = await mailer.sendMail({
    to: email,
    from: config.FROM_EMAIL,
    subject: `Password Reset | ${sitename}`,
    html: `<h1>Password Reset</h1>
           <p>Hello, you\'ve requested a password reset.</p>
           <p><a href="${resetPasswordLink}">Click here to reset your password</a>, if you did not make this request please disregard the email.</p>`,
  });

  return info;
};

const sendActivationEmail = async (email, token) => {
  const sitename = config.SITENAME;
  const activationEmailLink = `${sitename}/api/users/activate/${email}/${token}`;

  const info = await mailer.sendMail({
    to: email,
    from: config.FROM_EMAIL,
    subject: `Activate your account | ${sitename}`,
    html: `<h1>Activate</h1>
           <p>Hello, thanks for signing up.</p>
           <p><a href="${activationEmailLink}">Click here to activate your account</a>, if you did not create an account with us please disregard.</p>`,
  });

  return info;
};

module.exports = {
  sendPasswordResetEmail,
  sendActivationEmail,
};
