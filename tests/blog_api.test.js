const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)

const Blog = require("../models/blog");

beforeEach(async () => {
  // clear testing DB
  await Blog.deleteMany({});

  const blog = new Blog({
    title: "Testing API endpoints with supertest",
    content: "<p>This is just a paragraph</p>",
  });

  await blog.save()
});

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as JSON", async () => {
    await api.get("/api/blogs").expect(200).expect("Content-Type", /application\/json/);
  })
})

afterAll(() => {
  mongoose.connection.close()
})