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

usersRouter.delete("/:id", async (request, response, next) => {
  // get user id from url
  const userToDelete = await User.findById(request.params.id);

  if (userToDelete) {
    await User.findByIdAndRemove(userToDelete.id);
    response.status(204).end();
  }
});

usersRouter.put("/:id", async (request, response, next) => {
  const body = request.body;

  const user = {
    email: body.email,
    name: body.name,
    passwordHash: body.passwordHash,
  };

  const updatedUser = await User.findByIdAndUpdate(request.params.id, user, {
    new: true,
  });

  response.status(200).json(updatedUser);
});

module.exports = usersRouter;
