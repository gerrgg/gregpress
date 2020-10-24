const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const validateEmail = (email) => {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, "Please fill a valid email address"],
  },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  admin: { type: Boolean, default: false },
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
