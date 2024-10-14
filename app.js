const express = require("express");
const cors = require('cors');
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "config/config.env" });
}

const corsOptions = {
  origin:["http://localhost:3000", "https://friendzone-backend-2.onrender.com"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
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
