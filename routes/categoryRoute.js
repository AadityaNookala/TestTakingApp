const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const categoryController = require("../controllers/categoryController");
router
  .route("/getNextTask/:testName/:categoryName")
  .get(categoryController.getNextTask);
router.route("/clone/:categoryName").get(categoryController.whetherIsClone);

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);
router
  .route("/:testName")
  .get(categoryController.whetherThereAreMeaningsInTest);
router
  .route("/:testName")
  .get(categoryController.whetherThereAreMeaningsInCategory);
router.route("/:categoryName").patch(categoryController.addNewTest);

module.exports = router;
