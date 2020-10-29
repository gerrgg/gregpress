const bcrypt = require("bcrypt");
const helper = require("../utils/helper");
const resetPasswordRouter = require("express").Router();
const mailer = require("../utils/mailer");
const User = require("../models/user");

resetPasswordRouter.post("/", async (request, response) => {
  // get email from request
  const { body } = request;

  // get the user with matching email
  const user = await User.findOne({ email: body.email });

  // if not found return error
  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  // if user generate a token
  const resetToken = helper.generateToken();

  // create a new user object with the resetPasswordHash defined
  const update = {
    resetToken,
  };

  // update user model with the password hash
  const updatedUser = await User.findByIdAndUpdate(user.id, update, {
    new: true,
  });

  // send the mail
  await mailer.sendPasswordResetEmail(body.email, resetToken);

  await helper.unsetResetToken(user.id);

  // return the updated user with the hash set
  response.status(200).json(updatedUser);
});

resetPasswordRouter.post("/:email/:token", async (request, response) => {
  // get email from request
  const { params } = request;

  // the the posted password
  const { body } = request;

  // get the user with matching email
  const user = await User.findOne({ email: params.email });

  // if no token, user or the token doesnt match the users return error
  if (!helper.resetTokenIsValid(user, params.token)) {
    return response.status(400).json({ error: "Link is invalid or expired" });
  }

  // if no password - return error
  if (!body.password)
    return response.status(400).json({ error: "Please enter a new password" });

  // hash the new password and unset the resetToken
  const update = {
    passwordHash: await bcrypt.hash(body.password, 10),
    resetToken: "",
  };

  // update the user
  const updatedUser = await User.findByIdAndUpdate(user.id, update, {
    new: true,
  });

  response.status(200).json(updatedUser);
});

module.exports = resetPasswordRouter;
