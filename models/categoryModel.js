const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  tests: {
    type: Array,
    required: true,
  },
  withMeanings: {
    type: Boolean,
    required: true,
  },
  isClone: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("category", categoriesSchema);
