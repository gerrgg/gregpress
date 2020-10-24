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

  const admin = {
    email: "drbignsexi@gmail.com",
    name: "Greg Bastianelli",
    password: "password",
  };

  await helper.createUser(user);
  await helper.createUser(admin);
});

describe("when there is initially some users saved", () => {
  test("users are returned as JSON", async () => {
    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.length).toBeGreaterThan(0);
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

  test("users can only be deleted by users with proper authorization", async () => {
    const usersBeforeDelete = await helper.getUsers();

    // we need to login to delete stuff
    const response = await helper.login(usersBeforeDelete[0].email, "password");

    const token = response.body.token;

    await api
      .delete(`/api/users/${usersBeforeDelete[0].id}`)
      .set("Authorization", "Bearer " + token)
      .expect(204); // no further content

    const usersAfterDelete = await helper.getUsers();

    expect(usersAfterDelete.length).toBeLessThan(usersBeforeDelete.length);
  });

  test("successfully editing a user returns 200 status OK", async () => {
    // get a user
    const usersBeforeDelete = await helper.getUsers();
    const firstUser = usersBeforeDelete[0];

    const newName = "some other name";

    // copy first user object but change name
    const updatedFirstUser = { ...firstUser, name: newName };

    const response = await api
      .put(`/api/users/${firstUser.id}`)
      .send(updatedFirstUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.name).toBe(newName);
  });

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
    const credentials = {
      email: "somestudpidemail@dum.dm",
      password: "123123123",
    };

    await api.post("/api/login").send(credentials).expect(401);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
