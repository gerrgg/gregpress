// hide environment variables in .env
require("dotenv").config();

// set which port we are running the server on
const PORT = process.env.PORT;

// the URI to our NO-SQL database
let MONGODB_URI = process.env.MONGODB_URI;

let SITENAME = "gregpress.com";

if (process.env.NODE_ENV === "development") {
  SITENAME = `localhost:${PORT}`;
}

const FROM_EMAIL = `no-reply@${SITENAME}`;

// use a seperate database for testing
if (process.env.NODE_ENV === "test") {
  MONGODB_URI = process.env.MONGODB_TEST_URI;
}

module.exports = {
  MONGODB_URI,
  PORT,
  SITENAME,
  FROM_EMAIL,
};
