const usersData = require("../models/userModel.js");
exports.createUser = async (req, res) => {
  try {
    const user = await usersData.findOne({ userName: req.body.userName });
    if (user) throw new Error("User already exists");
    const newUser = await usersData.create({
      userName: req.body.userName,
      password: req.body.password,
      testCategories: [],
    });
    res.status(201).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const data = await usersData.find();
    res.status(201).json({
      status: "success",
      data: {
        data,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const data = await usersData.findOne({ userName: req.params.userName });
    res.status(201).json({
      status: "success",
      data,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updateOne = await usersData.findOneAndUpdate(
      { userName: req.params.userName },
      { testCategories: req.body },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        updateOne,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
