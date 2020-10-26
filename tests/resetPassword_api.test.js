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

describe("When resetting a users password", () => {
  jest.useFakeTimers();

  test("if a valid user requests a password change, they should be assigned a hash", async () => {
    const userBefore = await helper.getUser();

    expect(userBefore.passwordResetHash).toBe("");

    await api
      .post("/api/reset-password")
      .send({ email: userBefore.email })
      .expect(200);

    const userAfter = await helper.getUser();

    expect(userAfter.passwordResetHash).not.toBeNull();
  });

  test("if the email is invalid - should return 400 bad request", async () => {
    await api
      .post("/api/reset-password")
      .send({ email: "notarealuser@gmail.com" })
      .expect(400);
  });

  test("password reset should expire in 30 minutes", async () => {
    const userBefore = await helper.getUser();
    const OneHour = 60000;

    expect(userBefore.passwordResetHash).toBe("");

    await api
      .post("/api/reset-password")
      .send({ email: userBefore.email })
      .expect(200);

    const userAfter = await helper.getUser();

    expect(userAfter.passwordResetHash).not.toBeNull();

    jest.advanceTimersByTime(OneHour);

    const userAfterExpiration = await helper.getUser();

    expect(userAfterExpiration.passwordResetHash).toBe("");
  });
});

afterAll(() => {
  mongoose.connection.close();
});
