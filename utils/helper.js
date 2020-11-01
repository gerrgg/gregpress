const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Upload = require("../models/upload");

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

const unsetResetToken = async (id) => {
  setTimeout(async () => {
    await User.findByIdAndUpdate(
      id,
      { resetToken: "" },
      {
        new: true,
      }
    );
  }, 30000);
};

const validateFileName = (name) => {
  // get standard base path from year/month
  const basePath = getBaseUploadPath();

  // build path
  let path = `${basePath}/${name}`;

  // split to keep extension
  let fileName = name.split(".");

  // incrementor
  let i = 0;

  // if path is taken, increment filename until its not.
  if (fs.existsSync(path)) {
    while (fs.existsSync(path)) {
      path = `${basePath}/${fileName[0]}-${i}.${fileName[1]}`;
      i++;
    }
  }

  // return the path once weve got a valid one
  return path;
};

const uploadFile = async (file, user) => {
  // get path for easy passing
  const path = validateFileName(file.name);

  const upload = new Upload({
    fileName: path.split("/").pop(),
    fullPath: path,
    type: file.mimetype,
    user: user._id,
  });

  // move to where it goes
  await file.mv(upload.fullPath);

  // save to db
  await upload.save();

  return upload;
};

module.exports = {
  generateToken,
  resetTokenIsValid,
  getBaseUploadPath,
  unsetResetToken,
  validateFileName,
  uploadFile,
};
