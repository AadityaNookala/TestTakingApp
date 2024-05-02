const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const allUpdatesRouter = require("./routes/allUpdatesRoute.js");
const categoryRouter = require("./routes/categoryRoute.js");
const scoreRouter = require("./routes/scoreRoute.js");
const testRouter = require("./routes/testRoute.js");
const userRouter = require("./routes/userRoute.js");
const versionRouter = require("./routes/versionRoute.js");
dotenv.config({ path: "./config.env" });
const app = express();
app.use(cors());
app.use(express.json());

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log("DB connection successful"));

const port = 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
app.use("/categories", categoryRouter);
app.use("/score", scoreRouter);
app.use("/test", testRouter);
app.use("/user", userRouter);
app.use("/version", versionRouter);
app.use("/word-meaning", allUpdatesRouter);
app.use("/random", allUpdatesRouter);
app.use("/update", allUpdatesRouter);
app.use("/updateTestCategory", allUpdatesRouter);
app.use("/update/clone", allUpdatesRouter);
app.use("/remove-clues", allUpdatesRouter);
