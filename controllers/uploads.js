const uploadsRouter = require("express").Router();
const helper = require("../utils/helper");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Upload = require("../models/upload");

uploadsRouter.get("/", async (request, response) => {
  // find them all
  const uploads = await Upload.find({});

  // return in JSON
  response.status(200).json(uploads);
});

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

  // put all our promises in one basket
  const promiseArray = Object.keys(files).map((key) =>
    helper.uploadFile(files[key], user)
  );

  // then do em all at once
  const uploadedFiles = await Promise.all(promiseArray);

  return response.status(201).json(uploadedFiles);
});

module.exports = uploadsRouter;
