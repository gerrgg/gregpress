// Configuration for database
const config = require("./utils/config");

// Fast, unopinionated, minimalist web framework for Node.js
const express = require("express");

// Adds a layer around async operations to catch errors and pass to error handler
require("express-async-errors");

// file uploads
const fileUpload = require("express-fileupload");

// build an app with express
const app = express();

// Allows cross-origin requests
const cors = require("cors");

// Logs requests and handles errors gracefully
const middleware = require("./utils/middleware");

// Logs info and errors
const logger = require("./utils/logger");

// Routes
const resetPasswordRouter = require("./controllers/resetPassword");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const uploadsRouter = require("./controllers/uploads");

// Database object
const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const connectToDb = async () => {
  try {
    logger.info("connecting to " + config.MONGODB_URI);
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("connected to MongoDB");
  } catch (e) {
    logger.error("error connecting to MongoDB:", e.message);
  }
};

connectToDb();

app.use(cors());

app.use(
  fileUpload({
    createParentPath: true,
    // debug: true,
  })
);

app.use(express.static("build"));
app.use(express.json());

// logs requests
app.use(middleware.requestLogger);

// extract the token set in authorization headers
app.use(middleware.tokenExtractor);

// Setup endpoints
app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/reset-password", resetPasswordRouter);
app.use("/api/uploads", uploadsRouter);

// use the testing DATABASE for tests
if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

// Error handling
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
