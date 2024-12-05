const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const authController = require("../controllers/authController");

router.route("/updatetest").patch(testController.updateTestForScores);
router.route("/:testName/:testCategory").get(testController.getTest);
router
  .route("/:testName")
  .patch(authController.restrictTo("admin"), testController.updateTest);

router
  .route("/:categoryName")
  .post(authController.restrictTo("admin"), testController.createTest);
router
  .route("/:oldTestName/:categoryName")
  .patch(authController.restrictTo("admin"), testController.editTestName);
module.exports = router;
