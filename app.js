const express = require("express");
const cors = require('cors');
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "config/config.env" });
}

// CORS options to allow requests from the frontend (http://localhost:3000)
const corsOptions = {
  origin: 'http://localhost:3000',  // Replace with your frontend URL
  credentials: true,  // Allow cookies to be sent
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",  // Allowed methods
  allowedHeaders: "Content-Type,Authorization",  // Allowed headers
  optionsSuccessStatus: 200  // For legacy browser support
};

// Apply CORS middleware to handle cross-origin requests
app.use(cors(corsOptions));

// Preflight requests handling
app.options('*', cors(corsOptions));

// Middleware to parse JSON, URL-encoded data, and cookies
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(cookieParser());

// Importing Routes
const post = require("./routes/post");
const user = require("./routes/user");

// Using Routes
app.use("/api/v1", post);
app.use("/api/v1", user);

module.exports = app;
