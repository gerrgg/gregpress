const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

const getBlogs = async () => await Blog.find({});

const getUsers = async () => await User.find({});

const createUser = async (user) => await api.post("/api/users").send(user);

const login = async (email, password) =>
  await api.post("/api/login").send({ email, password });

module.exports = {
  getBlogs,
  getUsers,
  createUser,
  login,
};
