const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
router
  .route("/")
  .post(authController.restrictTo("admin"), userController.createUser)
  .get(userController.getAllUsers);
router
  .route("/:userName")
  .get(userController.getUser)
  .patch(authController.restrictTo("admin"), userController.updateUser);
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
module.exports = router;
