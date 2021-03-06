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
  test("Should return bad request when we dont attach any files", async () => {
    await api.post(`/api/uploads`).expect(400);
  });

  test("should return 401 if we try to upload without authorization", async () => {
    const buffer = Buffer.from("some data");

    await api
      .post(`/api/uploads`)
      .attach("img", buffer, "somefilename.txt")
      .expect(401);
  });

  test("should return 200 if we upload a file and have authorization", async () => {
    const user = await helper.getUser();
    const response = await helper.login(user.email, "password");

    const { token } = response.body;

    const buffer = Buffer.from("some data");

    await api
      .post(`/api/uploads`)
      .set("Authorization", `bearer ${token}`)
      .attach("img", buffer, "filename.txt")
      .expect(201);
  });

  test("can handle multiple uploads at once and duplicate filepaths", async () => {
    const user = await helper.getUser();
    const response = await helper.login(user.email, "password");

    const { token } = response.body;

    const buffer = Buffer.from("some data");

    const uploadResponse = await api
      .post(`/api/uploads`)
      .set("Authorization", `bearer ${token}`)
      .attach("img", buffer, "filename.txt")
      .attach("img2", buffer, "filename.txt")
      .expect(201);

    expect(uploadResponse.body.length).toBe(2);
    expect(uploadResponse.body[0].fileName).not.toBe(
      uploadResponse.body[1].fileName
    );
  });
});

afterAll(() => {
  mongoose.connection.close();
});
