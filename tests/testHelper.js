const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

const getBlogs = async () => Blog.find({});

const getUsers = async () => User.find({});

const getUser = async () => {
  const users = await User.find({});
  return users[0];
};

const createUser = async (user) => api.post("/api/users").send(user);

const login = async (email, password) =>
  api.post("/api/login").send({ email, password });

const getUploadedFilesPath = () => {
  const today = new Date();
  const siteURL = process.cwd();

  return `${siteURL}/uploads/${today.getFullYear()}/${today.getMonth()}`;
};

module.exports = {
  getBlogs,
  getUsers,
  getUser,
  createUser,
  login,
  getUploadedFilesPath,
};
