const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./testHelper");
const app = require("../app");
const api = supertest(app);

const User = require("../models/user")

beforeEach(async () => {
  // clear testing DB
  await User.deleteMany({});

  const user = new User({
    email: "drstupidface@aol.com",
    name: "Jeremy Corbin",
  });

  await user.save();
});

describe("when there is initially some users saved", () => {
  test("users are returned as JSON", async () => {
    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/)
      
      expect(response.body.length).toBe(1);
  });
})

afterAll(() => {
  mongoose.connection.close();
});
