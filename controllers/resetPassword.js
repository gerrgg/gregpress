const bcrypt = require("bcrypt");
const helper = require("../utils/helper");
const resetPasswordRouter = require("express").Router();
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
  const token = helper.generateToken();

  // create a new user object with the resetPasswordHash defined
  const update = {
    passwordResetHash: await bcrypt.hash(token, 10),
  };

  // update user model with the password hash
  const updatedUser = await User.findByIdAndUpdate(user.id, update, {
    new: true,
  });

  // setup timer to reset password hash in 30 minutes
  setTimeout(async () => {
    await User.findByIdAndUpdate(
      user.id,
      { passwordResetHash: "" },
      { new: true }
    );
  }, 30000); // half hour

  // return the updated user with the hash set
  response.status(200).json(updatedUser);
});

module.exports = resetPasswordRouter;
