const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config({ path: "./config.env" });

const allUpdatesRouter = require("./routes/allUpdatesRoute.js");
const categoryRouter = require("./routes/categoryRoute.js");
const scoreRouter = require("./routes/scoreRoute.js");
const testRouter = require("./routes/testRoute.js");
const userRouter = require("./routes/userRoute.js");
const versionRouter = require("./routes/versionRoute.js");
const { protect } = require("./controllers/authController.js");

const nonProtectedRoutes = ["/user/login"];

const DB = process.env.DATABASE_TEST_TAKING.replace(
  "<USERNAME>",
  process.env.DB_USERNAME
).replace("<PASSWORD>", process.env.PASSWORD);
mongoose.connect(DB).then(() => console.log("DB connection successful"));

const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN_URL_FOR_TESTS,
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  if (req.method === "POST" && nonProtectedRoutes.includes(req.path)) {
    next();
  } else {
    protect(req, res, next);
  }
});

const port = 7000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

app.use("/categories", categoryRouter);
app.use("/score", scoreRouter);
app.use("/test", testRouter);
app.use("/user", userRouter);
app.use("/version", versionRouter);
app.use("/key-terms", allUpdatesRouter);
app.use("/word-meaning", allUpdatesRouter);
app.use("/update/clone", allUpdatesRouter);
app.use("/remove-clues", allUpdatesRouter);
app.use("/", allUpdatesRouter);

exports.spellingsApi = app;
