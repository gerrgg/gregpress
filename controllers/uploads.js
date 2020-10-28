const uploadsRouter = require("express").Router();
const helper = require("../utils/helper");

uploadsRouter.post("/", async (request, response) => {
  // no files
  const { files } = request;

  if (!files || Object.keys(files).length === 0) {
    return response.status(400).send("No files were uploaded.");
  }

  Object.keys(files).forEach(async (name, file) => {
    console.log("controller", file);
    await helper.upload(file);
  });

  return response.status(200);
});

module.exports = uploadsRouter;
