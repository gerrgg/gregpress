const usersRouter = require("express").Router()

// Mongoose schema model
const User = require("../models/user")

usersRouter.get("/", async (request, response) => {
  // find them all
  const users = await User.find({});

  //return in JSON
  response.status(200).json(users);
});

module.exports = usersRouter