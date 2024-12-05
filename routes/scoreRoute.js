const express = require("express");
const router = express.Router();
const scoreController = require("../controllers/scoreController");
const authController = require("../controllers/authController");
router.route("/:userName").get(scoreController.resultsNeededForFirstScorePage);
router
  .route("/:userName/:testName")
  .get(
    authController.restrictTo("admin"),
    scoreController.resultsNeededForSecondScorePage
  );
router
  .route("/getMistakes/:userName/:testName")
  .get(
    authController.restrictTo("admin"),
    scoreController.resultsNeededForThirdScorePage
  );
router
  .route("/")
  .patch(
    authController.restrictTo("admin"),
    scoreController.createOrUpdateScore
  );

module.exports = router;
