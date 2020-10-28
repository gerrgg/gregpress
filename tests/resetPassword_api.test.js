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

jest.useFakeTimers();

describe("When resetting a users password", () => {
  test("if a valid user requests a password change, they should be assigned a hash", async () => {
    const userBefore = await helper.getUser();

    expect(userBefore.resetToken).toBe("");

    await api
      .post("/api/reset-password")
      .send({ email: userBefore.email })
      .expect(200);

    const userAfter = await helper.getUser();

    expect(userAfter.resetToken).not.toBeNull();
  });

  test("if the email is invalid - should return 400 bad request", async () => {
    await api
      .post("/api/reset-password")
      .send({ email: "notarealuser@gmail.com" })
      .expect(400);
  });

  test("password resets expire in 30 minutes", async () => {
    const userBefore = await helper.getUser();
    const OneHour = 60000;

    expect(userBefore.resetToken).toBe("");

    await api
      .post("/api/reset-password")
      .send({ email: userBefore.email })
      .expect(200);

    const userAfter = await helper.getUser();

    expect(userAfter.resetToken).not.toBeNull();

    jest.advanceTimersByTime(OneHour);

    const userAfterExpire = await helper.getUser();

    expect(userAfterExpire.resetToken).toBe("");
  });

  test("users with matching email and token can reset password", async () => {
    const userBefore = await helper.getUser();

    await api
      .post("/api/reset-password")
      .send({ email: userBefore.email })
      .expect(200);

    const userAfter = await helper.getUser();

    expect(userAfter.resetToken).not.toBeNull();

    await api
      .post(`/api/reset-password/${userAfter.email}/${userAfter.token}`)
      .send({ password: "password2" })
      .expect(200);

    await api
      .post("/api/login")
      .send({ email: userAfter.email, password: "password2" })
      .expect(200);

    const userAfterResetingPassword = await helper.getUser();

    expect(userAfterResetingPassword.resetToken).toBe("");
    expect(userAfterResetingPassword.passwordHash).not.toBe(
      userBefore.passwordHash
    );
  });
});

afterAll(() => {
  mongoose.connection.close();
});
