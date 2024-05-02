const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const categoriesData = require("../models/categoryModel.js");
const testData = require("../models/testModel.js");
exports.getTest = async (req, res) => {
  try {
    let test = await testData.findOne({
      testName: { $in: [req.params.testName] },
    });
    test = test.toObject();
    test.testName = req.params.testName;
    res.status(200).json({
      status: "success",
      data: {
        test,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createTest = async (req, res) => {
  try {
    const category = await categoriesData.findOne({
      categoryName: req.params.categoryName,
    });
    const test = await testData.findOne({
      testName: { $in: [category.tests[0]] },
    });
    const updatedBody = { ...req.body };
    updatedBody.testName = [req.body.testName];
    if (test) {
      const allCategories = await categoriesData.find();
      for (const el of allCategories) {
        test.testName.forEach(async (element, i) => {
          if (el.tests.includes(element)) {
            if (i !== 0) {
              const updatedTestName =
                updatedBody.testName[0] + element.split(test.testName[0])[1];
              if (!updatedBody.testName.includes(updatedTestName)) {
                el.tests.push(updatedTestName);

                updatedBody.testName.push(updatedTestName);
              }
            }
            await categoriesData.findOneAndUpdate(
              { categoryName: el.categoryName },
              { $set: { tests: el.tests } }
            );
          }
        });
      }
    }
    const newTest = await testData.create(updatedBody);
    res.status(201).json({
      status: "success",
      data: {
        newTest,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateTest = async (req, res) => {
  try {
    let response;
    const fields = Object.keys(req.body).join(" ");
    if (req.query.currentIndex || +req.query.currentIndex === 0) {
      const filter = {
        testName: req.params.testName,
      };
      response = await testData.findOne(filter).select(fields);
      const length = Object.values(response.toJSON()).find((element) =>
        Array.isArray(element)
      ).length;
      if (+req.query.currentIndex >= length) {
        Object.keys(response.toJSON()).forEach((key) => {
          if (key == "_id") return;
          response[key].push(req.body[key]);
        });
      } else {
        Object.keys(response.toJSON()).forEach((key) => {
          if (key == "_id") return;
          response[key][+req.query.currentIndex] = req.body[key];
        });
      }
      response = await testData.updateOne(filter, { $set: response });
    } else {
      response = await testData.findOneAndUpdate(
        { assignedTo: req.params.personName, taskName: req.params.taskName },
        req.body
      );
    }
    res.status(200).json({
      status: "success",
      data: {
        updatedRecord: response,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.editTestName = async (req, res) => {
  try {
    let data = await testData.findOne({
      testName: { $in: [req.params.oldTestName] },
    });
    data = data.toObject();
    const test = [req.body.testName];
    data.testName.forEach(async (el, i) => {
      const dataCategories = await categoriesData.findOne({
        tests: { $in: [el] },
      });
      if (i !== 0) {
        test.push(
          req.body.testName + el.substring(req.params.oldTestName.length)
        );
        dataCategories.tests[dataCategories.tests.indexOf(el)] =
          req.body.testName + el.substring(req.params.oldTestName.length);
      } else {
        dataCategories.tests[dataCategories.tests.indexOf(el)] =
          req.body.testName;
      }
      await categoriesData.findOneAndUpdate(
        {
          tests: { $in: [el] },
        },
        {
          $set: { tests: dataCategories.tests },
        }
      );
    });
    await testData.findOneAndUpdate(
      {
        testName: { $in: [req.params.oldTestName] },
      },
      { $set: { testName: test } }
    );
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
