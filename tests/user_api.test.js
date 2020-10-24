const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./testHelper");
const app = require("../app");
const api = supertest(app);

const User = require("../models/user");

beforeEach(async () => {
  // clear testing DB
  await User.deleteMany({});

  const user = new User({
    email: "drstupidface@aol.com",
    name: "Jeremy Corbin",
    passwordHash: "password",
  });

  await user.save();
});

describe("when there is initially some users saved", () => {
  test("users are returned as JSON", async () => {
    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.length).toBe(1);
  });

  test("users with valid credentials are return 201 created and new user object", async () => {
    const user = {
      email: "greg@iamgreg.xyz",
      name: "Greg Bastianelli",
      password: "password",
    };

    const response = await api
      .post("/api/users")
      .send(user)
      .expect(201) //created
      .expect("Content-Type", /application\/json/);

    expect(response.body.email).toBe(user.email);
  });

  test("users with invalid credentials return 400 and error", async () => {
    const user = {
      name: "Greg Bastianelli",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(user)
      .expect(400) //created
      .expect("Content-Type", /application\/json/);
  });

  test("user emails are unique", async () => {
    const user1 = {
      email: "greg@iamgreg.xyz",
      name: "Greg Bastianelli",
      password: "password",
    };

    const user2 = {
      email: "greg@iamgreg.xyz",
      name: "Greg Bastianelli",
      password: "password",
    };

    //create user 1
    await api.post("/api/users").send(user1).expect(201);

    //create user 2
    await api.post("/api/users").send(user2).expect(400);
  });

  test("user emails must be valid emails", async () => {
    const user1 = {
      email: "greg.xyz",
      name: "Greg Bastianelli",
      password: "password",
    };

    const user2 = {
      email: "greg@iamgreg@.xyz",
      name: "Greg Bastianelli",
      password: "password",
    };

    const user3 = {
      email: "g.g.g.g.giamgreg@.xyz",
      name: "Greg Bastianelli",
      password: "password",
    };

    const user4 = {
      email: "greg@greg.com",
      name: "Greg Bastianelli",
      password: "password",
    };

    await api.post("/api/users").send(user1).expect(400);
    await api.post("/api/users").send(user2).expect(400);
    await api.post("/api/users").send(user3).expect(400);
    await api.post("/api/users").send(user4).expect(201);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
