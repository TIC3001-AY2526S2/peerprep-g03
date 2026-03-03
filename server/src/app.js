// Express app setup + routes
const express = require("express");
const cors = require("cors");

const questionRoutes = require("./routes/questions");

const app = express();

app.use(cors());
app.use(express.json());

// Mount all API routes under /api
app.use("/api", questionRoutes);

module.exports = app;