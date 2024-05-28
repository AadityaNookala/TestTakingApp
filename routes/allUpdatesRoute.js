const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const allUpdateController = require("../controllers/allUpdatesController");
router.route("/:word").get(allUpdateController.getMeaning);
router.route("/random/:userName").get(allUpdateController.randomTest);
router
  .route("/update/:oldTestName/:categoryName")
  .patch(allUpdateController.editTestName);
router
  .route("/update/:oldTestCategoryName")
  .patch(allUpdateController.editTestCategoryName);
router
  .route("/updateTestCategory/:oldCategoryName")
  .post(allUpdateController.clone);
router.route("/").post(allUpdateController.removeClues);

module.exports = router;
