const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./testHelper");
const app = require("../app");

const api = supertest(app);

const User = require("../models/user");

beforeEach(async () => {
  // clear testing DB
  await User.deleteMany({});

  const user = {
    email: "drstupidface@aol.com",
    name: "Jeremy Corbin",
    password: "password",
  };

  await helper.createUser(user);
});

describe("when logging users in", () => {
  test("users can log in to the application with proper credentials", async () => {
    const usersBeforeDelete = await helper.getUsers();
    const firstUser = usersBeforeDelete[0];

    const credentials = {
      email: firstUser.email,
      password: "password",
    };

    const response = await api.post("/api/login").send(credentials).expect(200);

    expect(response.body.email).toBe(firstUser.email);
    expect(response.body.token).not.toBeNull();
  });

  test("logging in with invalid credentials returns 401 unauthorized", async () => {
    const usersBeforeDelete = await helper.getUsers();
    const firstUser = usersBeforeDelete[0];

    const credentials = {
      email: firstUser.email,
      password: "nothepassword",
    };

    await api.post("/api/login").send(credentials).expect(401);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
