const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const dailyLogRouter = require("./routes/dailyLogRoutes/dailyLogRoutes");
const logBookRouter = require("./routes/logBookRoutes/logbookRoutes");
const userRouter = require("./routes/userRoutes/userRoutes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (
        configuredOrigins.includes(origin) ||
        (!process.env.CORS_ORIGINS &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

//* Routes
app.use("/api/daily-logs", dailyLogRouter);
app.use("/api/logbooks", logBookRouter);
app.use("/api/users", userRouter);

//* Return JSON for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

//* Centralized error middleware
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(error.status || 500).json({
    message: error.status ? error.message : "Internal Server Error",
  });
});

//* Listen for incoming requests
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});