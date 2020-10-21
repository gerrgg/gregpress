// Configuration for database 
const config = require('./utils/config')

// Fast, unopinionated, minimalist web framework for Node.js
const express = require('express')

// Adds a layer around async operations to catch errors and pass to error handler
require("express-async-errors");

// build an app with express
const app = express()

// Allows cross-origin requests
const cors = require("cors");

// Logs requests and handles errors gracefully
const middleware = require("./utils/middleware");

// Logs info and errors
const logger = require("./utils/logger");

// Routes
const blogsRouter = require("./controllers/blogs");

// Database object
const mongoose = require("mongoose")

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
}

connectToDb();

app.use(cors())
app.use(express.static("build"))
app.use(express.json())

// logs requests
app.use(middleware.requestLogger);

// Setup endpoints
app.use('/api/blogs', blogsRouter)

// use the testing DATABASE for tests
if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}


// Error handling
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app