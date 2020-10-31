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
  let i = 1;

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

const uploadFiles = async (files) => {
  // keep track of what was uploaded
  let uploadedFiles = [];

  // upload each file passed
  Object.keys(files).forEach(async (key) => {
    // get the file from the array
    const file = files[key];

    // get path for easy passing
    const path = validateFileName(file.name);

    const upload = new Upload({
      fileName: path.split("/").pop(),
      fullPath: path,
      type: file.mimetype,
    });

    // save to db
    await upload.save();

    // move to where it goes
    file.mv(upload.fullPath, (error) => {
      if (error) console.log(error);
      // keep track of what was uploaded
      uploadedFiles.push(upload);
    });
  });

  return uploadedFiles;
};

module.exports = {
  generateToken,
  resetTokenIsValid,
  getBaseUploadPath,
  unsetResetToken,
  validateFileName,
  uploadFiles,
};
