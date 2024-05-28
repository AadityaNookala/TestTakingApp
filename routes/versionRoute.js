const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const versionController = require("../controllers/versionController");
router.route("/:testName").patch(versionController.createOrEditVersion);
module.exports = router;
