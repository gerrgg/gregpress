const supertest = require("supertest");

const Blog = require("../models/blog");
const User = require("../models/user");

const getBlogs = async () => await Blog.find({});

const getUsers = async () => await User.find({});

module.exports = { getBlogs, getUsers };
