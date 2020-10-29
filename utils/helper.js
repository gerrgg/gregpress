const fs = require("fs");
const path = require("path");
const User = require("../models/user");

// generate a token
const generateToken = () => {
  const rand = () => Math.random().toString(36).substr(2);
  return rand() + rand();
};

const resetTokenIsValid = (user, token) =>
  !(
    user &&
    token &&
    token !== user.resetToken &&
    user.resetTokenExpiration < Date.now()
  );

const getBaseUploadPath = () => {
  const today = new Date();
  const dir = path.dirname(__dirname);
  const year = String(today.getFullYear());
  const month = String(today.getMonth());

  return path.join(dir, "uploads", year, month);
};

const unsetResetToken = async (id) =>
  setTimeout(async () => {
    await User.findByIdAndUpdate(
      id,
      { resetToken: "" },
      {
        new: true,
      }
    );
  }, 30000);

module.exports = {
  generateToken,
  resetTokenIsValid,
  getBaseUploadPath,
  unsetResetToken,
};
