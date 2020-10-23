const usersRouter = require("express").Router();

// Mongoose schema model
const User = require("../models/user");
const blog = require("../models/blog");

usersRouter.get("/", async (request, response) => {
  // find them all
  const users = await User.find({});

  //return in JSON
  response.status(200).json(users);
});

usersRouter.post("/", async (request, response) => {
  const body = response.body;

  const user = new User({
    email: body.email,
    name: body.name,
  });

  const savedUser = await user.save();

  //return in JSON
  response.status(201).json(savedUser);
});

module.exports = usersRouter;
