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
});

describe("when creating users", () => {
  test("users with valid credentials are return 201 created and new user object and are inactive from default", async () => {
    const user = {
      email: "greg@iamgreg.xyz",
      name: "Greg Bastianelli",
      password: "password",
    };

    const response = await api
      .post("/api/users")
      .send(user)
      .expect(201) // created
      .expect("Content-Type", /application\/json/);

    expect(response.body.email).toBe(user.email);
    expect(response.body.active).not.toBe(user.active);
  });

  test("users with invalid credentials return 400 and error", async () => {
    const user = {
      name: "Greg Bastianelli",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(user)
      .expect(400) // created
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

    // create user 1
    await api.post("/api/users").send(user1).expect(201);

    // create user 2
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

describe("when deleting users", () => {
  test("users cannot delete themselves", async () => {
    const usersBeforeDelete = await helper.getUsers();

    // we need to login to delete stuff
    const response = await helper.login(usersBeforeDelete[0].email, "password");

    const { token } = response.body;

    await api
      .delete(`/api/users/${usersBeforeDelete[0].id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(401); // no further content

    const usersAfterDelete = await helper.getUsers();

    expect(usersAfterDelete.length).toBe(usersBeforeDelete.length);
  });

  test("users without cannot delete other users", async () => {
    const users = await helper.getUsers();

    const user = users[0];
    const admin = users[1];

    const response = await helper.login(user.email, "password");

    // non admin user token
    const { token } = response.body;

    await api
      .delete(`/api/users/${admin.id}`) // delete the admin
      .set("Authorization", `Bearer ${token}`) // with non admin token
      .expect(401); // unathorized
  });
});

describe("when editing users", () => {
  test("users can edit themselves", async () => {
    // get a user
    const usersBeforeDelete = await helper.getUsers();
    const firstUser = usersBeforeDelete[0];

    const loginResponse = await helper.login(firstUser.email, "password");

    // user token
    const { token } = loginResponse.body;

    // the edit
    const newName = "some other name";

    // copy first user object but change name
    const updatedFirstUser = { email: firstUser.email, name: newName };

    const response = await api
      .put(`/api/users/${firstUser.id}`)
      .send(updatedFirstUser)
      .set("Authorization", `Bearer ${token}`) // with non admin token
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.name).toBe(newName);
  });

  test("users cannot edit themselves unless they've logged in", async () => {
    // get a user
    const usersBeforeDelete = await helper.getUsers();
    const firstUser = usersBeforeDelete[0];

    // the edit
    const newName = "some other name";

    // copy first user object but change name
    const updatedFirstUser = { email: firstUser.email, name: newName };

    await api
      .put(`/api/users/${firstUser.id}`)
      .send(updatedFirstUser)
      .expect(401);
  });

  test("users cannot edit other users", async () => {
    // get a user
    const users = await helper.getUsers();

    const loginResponse = await helper.login(users[1], "password");

    // copy the second user but change the name to the first users name
    const updatedUser2 = { email: users[1].email, name: users[0].name };

    await api
      .put(`/api/users/${users[1].id}`) // edit first user
      .send(updatedUser2) // with updated name
      .set("Authorization", `Bearer ${loginResponse.body.token}`) // use an unathorized token
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

  test("should return 401 if activation token doesn't match activation Hash", async () => {
    const user = {
      email: "someemail@aol.com",
      name: "somename",
      password: "password",
    };

    const response = await helper.createUser(user);

    const createdUser = response.body;

    expect(createdUser.activationHash).not.toBe("");

    await api
      .get(`/api/users/activate/${createdUser.email}/${helper.generateToken()}`)
      .expect(401);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
