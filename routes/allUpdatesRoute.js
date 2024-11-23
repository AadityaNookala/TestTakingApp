const express = require("express");
const router = express.Router();

const allUpdateController = require("../controllers/allUpdatesController");
const authController = require("../controllers/authController");

router
  .route("/get-signed-url")
  .get(authController.restrictTo("admin"), allUpdateController.getSignedUrl);

router
  .route("/update/clone/updateTestCategory/:oldCategoryName")
  .post(authController.restrictTo("admin"), allUpdateController.clone);
router.route("/get-meaning/:word").get(allUpdateController.getMeaning);
router
  .route("/update/clone/updateTestCategory/:oldCategoryName")
  .post(authController.restrictTo("admin"), allUpdateController.clone);
router
  .route("/update/:oldTestName/:categoryName")
  .patch(authController.restrictTo("admin"), allUpdateController.editTestName);
router
  .route("/update/:oldTestCategoryName")
  .patch(
    authController.restrictTo("admin"),
    allUpdateController.editTestCategoryName
  );
router
  .route("/remove-clues")
  .post(authController.restrictTo("admin"), allUpdateController.removeClues);

module.exports = router;
