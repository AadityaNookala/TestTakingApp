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
      message: err.message,
    });
  }
};

exports.getOneCategory = async (req, res) => {
  try {
    const data = await categoriesData.findOne({
      categoryName: req.params.categoryName,
    });
    res.status(200).json({
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

exports.whetherIsClone = async (req, res) => {
  const clone = await categoriesData.findOne({
    categoryName: req.params.categoryName,
  });
  res.status(200).json({
    status: "success",
    data: clone,
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
      message: err.message,
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
      message: err.message,
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
      message: err.message,
    });
  }
};
