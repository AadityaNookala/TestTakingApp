const express = require("express");
const router = express.Router();
const versionController = require("../controllers/versionController");
const authController = require("../controllers/authController");
router
  .route("/:testName")
  .patch(
    authController.restrictTo("admin"),
    versionController.createOrEditVersion
  );
module.exports = router;
