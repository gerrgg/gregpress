const uploadsRouter = require("express").Router();
const helper = require("../utils/helper");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const User = require("../models/user");
const Upload = require("../models/upload");

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

  const uploadedFiles = await helper.uploadFiles(files);

  return response.status(201).json(uploadedFiles);
});

module.exports = uploadsRouter;
