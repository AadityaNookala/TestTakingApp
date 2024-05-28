const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const categoriesData = require("../models/categoryModel.js");

exports.getAllCategories = async (req, res) => {
  try {
    const data = await categoriesData.find();
    res.status(200).json({
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

exports.whetherThereAreMeaningsInTest = async (req, res) => {
  try {
    const data = await categoriesData.find();
    let meanings;
    data.forEach((el) => {
      if (el.tests.includes(req.params.testName)) {
        meanings = el.withMeanings;
        return;
      }
    });
    res.status(201).json({
      status: "success",
      data: {
        meanings,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.whetherIsClone = async (req, res) => {
  const clone = await categoriesData.findOne({
    categoryName: req.params.categoryName,
  });
  res.status(200).json({
    status: "success",
    data: {
      clone: clone,
    },
  });
};

exports.whetherThereAreMeaningsInCategory = async (req, res) => {
  try {
    const meanings = (
      await categoriesData.findOne({
        categoryName: req.params.categoryName,
      })
    ).withMeanings;
    res.status(201).json({
      status: "success",
      data: {
        meanings,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = await categoriesData.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        newCategory,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.addNewTest = async (req, res) => {
  try {
    const updateOne = await categoriesData.findOneAndUpdate(
      { categoryName: req.params.categoryName },
      req.body,
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

exports.getNextTask = async (req, res) => {
  try {
    const category = await categoriesData.findOne({
      categoryName: req.params.categoryName,
    });
    const nextTask =
      category.tests[category.tests.indexOf(req.params.testName) + 1];
    res.status(200).json({
      status: "success",
      data: {
        nextTask,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
