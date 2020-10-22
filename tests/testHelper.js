const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const testHelper = () => {
  const getBlogs = async () => {
    const blogs = await api.get("/api/blogs");
    return blogs;
  };

  return { getBlogs };
};

module.exports = testHelper;
