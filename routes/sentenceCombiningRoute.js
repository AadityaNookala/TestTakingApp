const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();
const sentenceCombiningController = require("../controllers/sentenceCombiningController.js");
