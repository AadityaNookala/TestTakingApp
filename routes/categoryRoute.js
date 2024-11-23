const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

router.route("/clone/:categoryName").get(categoryController.whetherIsClone);

router
  .route("/getCategory/:categoryName")
  .get(categoryController.getOneCategory);
router
  .route("/:categoryName")
  .get(categoryController.whetherThereAreMeaningsInCategory);
router
  .route("/:categoryName")
  .patch(authController.restrictTo("admin"), categoryController.addNewTest);
router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(authController.restrictTo("admin"), categoryController.createCategory);

module.exports = router;
