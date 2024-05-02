const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const testController = require("../controllers/testController");
router
  .route("/:testName")
  .get(testController.getTest)
  .patch(testController.updateTest);
router.route("/:categoryName").post(testController.createTest);
router.route("/:oldTestName/:categoryName").patch(testController.editTestName);
module.exports = router;
