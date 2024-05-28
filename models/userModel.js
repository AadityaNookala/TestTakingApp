const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  testCategories: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("user", usersSchema);
