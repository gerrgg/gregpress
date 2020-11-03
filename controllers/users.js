const usersRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const helper = require("../utils/helper");
const mailer = require("../utils/mailer");

// Mongoose schema model
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  // find them all
  const users = await User.find({});

  // return in JSON
  response.status(200).json(users);
});

usersRouter.get(`/activate/:email/:token`, async (request, response) => {
  const { params } = request;

  const user = await User.findOne({ email: params.email });

  if (!(await helper.tokenIsValid(user, params.token, "activation"))) {
    return response.status(401).json({ error: "Link is invalid or expired" });
  }

  const update = {
    active: true,
    activationHash: "",
  };

  const updatedUser = await User.findByIdAndUpdate(user.id, update, {
    new: true,
  });

  response.status(200).json(updatedUser);
});

usersRouter.post("/", async (request, response) => {
  const { body } = request;

  // generate token for activation email
  const activationToken = helper.generateToken();

  // hash token and save into DB
  const activationHash = await bcrypt.hash(activationToken, 10);

  // hash password
  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = new User({
    email: body.email,
    name: body.name,
    passwordHash,
    activationHash,
  });

  const savedUser = await user.save();

  if (process.env.NODE_ENV !== "test") {
    await mailer.sendActivationEmail(body.email, activationToken);
  }

  // return in JSON
  response.status(201).json(savedUser);
});

usersRouter.delete("/:id", async (request, response) => {
  // get user id from url
  const userToDelete = await User.findById(request.params.id);

  // decode token to get hidden properties
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  // get the user making the delete to confirm they are a admin
  const userAttemptingDelete = await User.findById(decodedToken.id);

  // user must have authorization and not be deleting themselves
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

usersRouter.put("/:id", async (request, response) => {
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
