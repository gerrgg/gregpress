const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

const getBlogs = async () => {
  const blogs = await Blog.find({});
  return blogs;
};

module.exports = { getBlogs };
