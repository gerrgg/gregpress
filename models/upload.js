const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fullPath: { type: String, required: true },
  date: { type: Date, default: Date.now() },
  type: { type: String, default: "" },
  alt: String,
  caption: String,
});

uploadSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Upload", uploadSchema);
