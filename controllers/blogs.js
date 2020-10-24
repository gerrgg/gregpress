const blogsRouter = require("express").Router();

// Mongoose schema model
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  // find them all
  const blogs = await Blog.find({});

  // return in JSON
  response.status(200).json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const { body } = request;

  // build blog object from request
  const blog = new Blog({
    title: body.title,
    content: body.content,
  });

  // convert into model
  const savedBlog = await blog.save();

  // 201 created - return saved blog
  response.status(201).json(savedBlog);
});

module.exports = blogsRouter;
