const mongoose = require("mongoose");

const scoresSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  testName: {
    type: String,
    required: true,
  },
  dates: {
    type: Array,
    required: true,
  },
  enteredSentence: {
    type: [
      {
        indexOfActualSentence: { type: Array, required: true },
        mistakenWords: { type: Array, required: true },
        score: { type: Number, required: true },
        version: { type: Number, required: true, default: 1 },
      },
    ],
    required: true,
  },
});

module.exports = mongoose.model("score", scoresSchema);
