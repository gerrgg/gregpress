const usersRouter = require("express").Router();
const bcrypt = require("bcrypt");

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
  const body = request.body;

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = new User({
    email: body.email,
    name: body.name,
    passwordHash: passwordHash,
    date: Date.now(),
  });

  const savedUser = await user.save();

  //return in JSON
  response.status(201).json(savedUser);
});

module.exports = usersRouter;
