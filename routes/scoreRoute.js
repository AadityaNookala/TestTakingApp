const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const scoreController = require("../controllers/scoreController");
router.route("/score").patch(scoreController.createOrUpdateScore);
router.route("/:userName").get(scoreController.resultsNeededForFirstScorePage);
router
  .route("/:userName/:testName")
  .get(scoreController.resultsNeededForSecondScorePage);
router
  .route("/getMistakes/:userName/:testName")
  .get(scoreController.resultsNeededForThirdScorePage);
module.exports = router;
