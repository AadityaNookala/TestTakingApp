const mongoose = require("mongoose");

const versionsSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
  },
  sentences: {
    type: Array,
    required: true,
  },
  indexes: {
    type: Array,
    required: true,
  },
  numberOfWords: {
    type: Array,
    required: true,
  },
  indexOfActualSentence: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("version", versionsSchema);
