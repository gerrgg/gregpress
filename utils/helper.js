const fs = require("fs");
const path = require("path");

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

const getUploadedFilesPath = () => {
  const today = new Date();
  const siteURL = process.cwd();

  return `${siteURL}/uploads/${today.getFullYear()}/${today.getMonth()}`;
};

const upload = async (file) => {
  // Build the uploads folder if its not already there
  const today = new Date();
  const dir = path.dirname(__dirname);
  const year = String(today.getFullYear());
  const month = String(today.getMonth());

  fs.mkdir(
    path.join(dir, "uploads", year, month),
    { recursive: true },
    (err) => {
      if (err) {
        return console.error(err);
      }
    }
  );

  console.log("helper", file);

  // move the file to directory
  const response = await file.mv(
    path.join(dir, "uploads", year, month, file.name)
  );

  response.status(200).send("File uploaded");
};

module.exports = {
  generateToken,
  resetTokenIsValid,
  getUploadedFilesPath,
  upload,
};
