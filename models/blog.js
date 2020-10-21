const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  date: {type: Date, default: Date.now},
  likes: Number,
})

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Blog", blogSchema);