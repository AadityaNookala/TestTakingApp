const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const allUpdateController = require("../controllers/allUpdatesController");
router.route("/:word").get(allUpdateController.getMeaning);
router.route("/:userName").get(allUpdateController.randomTest);
router
  .route("/:oldTestName/:categoryName")
  .patch(allUpdateController.editTestName);
router
  .route("/:oldTestCategoryName")
  .patch(allUpdateController.editTestCategoryName);
router.route("/:oldCategoryName").post(allUpdateController.clone);
router.route("/remove-clues").post(allUpdateController.removeClues);

module.exports = router;
