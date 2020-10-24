const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { body } = request;

  // find user with matching email
  const user = await User.findOne({ email: body.email });

  // if user is null return false, else return comparison of given password to user hash
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  // if valid return 401 unauthorized with error message
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "Invalid username or password combination",
    });
  }

  // create a token which contains the user email and id
  const userForToken = {
    email: user.email,
    id: user._id,
  };

  // the object is digitally signed using a secret phrase in the .env
  const token = jwt.sign(userForToken, process.env.SECRET);

  response.status(200).send({
    token,
    email: user.email,
    name: user.name,
    date: user.date,
  });
});

module.exports = loginRouter;
