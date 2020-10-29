const uploadsRouter = require("express").Router();
const helper = require("../utils/helper");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

uploadsRouter.post("/", async (request, response) => {
  const { files } = request;

  // no files
  if (!files || Object.keys(files).length === 0) {
    return response.status(400).send("No files were uploaded.");
  }

  // get the user's ID from the token
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  // get the user
  const user = await User.findById(decodedToken.id);

  // Ensure we have a user
  if (!(decodedToken && user)) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  // generate uploads folder path based on year and month
  const basePath = helper.getBaseUploadPath();

  // upload each file passed
  Object.keys(files).forEach((key) => {
    // get the file from the object
    const file = files[key];

    // move it into place
    file.mv(`${basePath}/${file.name}`, (error) => {
      if (error) return response.status(500).send(error);
      response.status(200).send("file uploaded");
    });
  });
});

module.exports = uploadsRouter;
