const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const userController = require("../controllers/userController");
router
  .route("/")
  .post(userController.createUser)
  .get(userController.getAllUsers);
router
  .route("/:userName")
  .get(userController.getUser)
  .patch(userController.updateUser);
module.exports = router;
