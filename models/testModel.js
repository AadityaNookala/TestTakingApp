const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  testName: {
    type: Array,
    required: true,
  },
  sentences: {
    type: Array,
    required: true,
  },
  answers: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("test", testSchema);
