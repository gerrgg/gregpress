const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

const getBlogs = async () => Blog.find({});

const getUsers = async () => User.find({});

const createUser = async (user) => api.post("/api/users").send(user);

const login = async (email, password) =>
  api.post("/api/login").send({ email, password });

module.exports = {
  getBlogs,
  getUsers,
  createUser,
  login,
};
