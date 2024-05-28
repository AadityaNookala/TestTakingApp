const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const usersData = require("../models/userModel.js");
exports.createUser = async (req, res) => {
  try {
    const newUser = await usersData.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
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
      message: err,
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
      message: err,
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
      message: err,
    });
  }
};
