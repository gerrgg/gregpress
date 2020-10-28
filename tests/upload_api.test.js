const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./testHelper");
const fs = require("fs");
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

describe("when uploading images", () => {
  test("uploading images requires authorization", async () => {
    fs.readFileSync(
      `${process.cwd()}/tests/sometext.txt`,
      async (error, data) => {
        await api.post(`/api/upload`).attach("img", data).expect(400);
      }
    );
  });

  test("logged in users can upload images", async () => {
    const user = await helper.getUser();
    const loggedInUser = await helper.login(user.email, "password");

    fs.readFileSync(
      `${process.cwd()}/tests/sometext.txt`,
      async (error, data) => {
        await api
          .post(`/api/upload`)
          .set("Authorization", `Bearer ${loggedInUser.body.token}`)
          .attach("img", data)
          .expect(200);
      }
    );
  });
});

afterAll(() => {
  mongoose.connection.close();
});
