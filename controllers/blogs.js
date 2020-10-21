const blogsRouter = require("express").Router()

// Mongoose schema model
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
  response.status(200).json(blogs)
})

module.exports = blogsRouter