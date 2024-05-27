const mongoose = require("mongoose");

const sentenceCombiningSchema = new mongoose.Schema({
  question: {
    type: Array,
    required: true,
  },
  answer: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("sentencecombining", sentenceCombiningSchema);
