const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);
router
  .route("/:testName")
  .get(categoryController.whetherThereAreMeaningsInTest);
router.route("/clone/:categoryName").get(categoryController.whetherIsClone);
router
  .route("/:testName")
  .get(categoryController.whetherThereAreMeaningsInCategory);
router.route("/:categoryName").patch(categoryController.addNewTest);
module.exports = router;
