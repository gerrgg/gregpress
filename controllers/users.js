const usersRouter = require("express").Router();
const jwt = require("jsonwebtoken");
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
    admin: body.admin ? body.admin : false,
  });

  const savedUser = await user.save();

  //return in JSON
  response.status(201).json(savedUser);
});

usersRouter.delete("/:id", async (request, response, next) => {
  // get user id from url
  const userToDelete = await User.findById(request.params.id);

  // decode token to get hidden properties
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  // get the user making the delete to confirm they are a admin
  const userAttemptingDelete = await User.findById(decodedToken.id);

  //user must have authorization and not be deleting themselves
  if (
    userToDelete &&
    decodedToken.id &&
    userToDelete.id.toString() === decodedToken.id.toString()
  ) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  // must be admin
  if (!userAttemptingDelete.admin)
    return response
      .status(401)
      .json({ error: "You do not have privledge to delete this user." });

  // delete the scrub
  await User.findByIdAndRemove(userToDelete.id);
  response.status(204).end();
});

usersRouter.put("/:id", async (request, response, next) => {
  const userToUpdate = await User.findById(request.params.id);

  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  // users can only edit themselves
  if (
    userToUpdate &&
    decodedToken.id &&
    userToUpdate.id.toString() !== decodedToken.id.toString()
  ) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const { body } = request;

  const user = {
    email: body.email,
    name: body.name,
  };

  const updatedUser = await User.findByIdAndUpdate(request.params.id, user, {
    new: true,
  });

  response.status(200).json(updatedUser);
});

module.exports = usersRouter;
