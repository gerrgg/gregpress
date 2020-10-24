const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./testHelper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  // clear testing DB
  await Blog.deleteMany({});

  const blog = new Blog({
    title: "Testing API endpoints with supertest",
    content: "<p>This is just a paragraph</p>",
  });

  await blog.save();
});

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as JSON", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("new blogs can be added and the created blog is returned as a response", async () => {
    const blog = {
      title: "How to do a POST request with axios",
      content: "<p>Axios is great for making api calls</p>",
    };

    const response = await api
      .post("/api/blogs")
      .send(blog) // YOU HAVE TO SEND OBJECT
      .expect(201) // 201 created
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(response.body.title);
  });

  test("a new blog should return 400 if missing required fields", async () => {
    const blog = {
      content: "<p>Axios is great for making api calls</p>",
    };

    const response = await api
      .post("/api/blogs")
      .send(blog) // YOU HAVE TO SEND OBJECT
      .expect(400) // 201 created
      .expect("Content-Type", /application\/json/);
  });

  test("blog likes default to 0", async () => {
    const blogs = await helper.getBlogs();

    expect(blogs[0].likes).toBe(0);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
