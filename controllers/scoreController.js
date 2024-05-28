const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const categoriesData = require("../models/categoryModel.js");
const scoresData = require("../models/scoreModel.js");
const testData = require("../models/testModel.js");
const versionsData = require("../models/versionModel.js");

exports.createOrUpdateScore = async (req, res) => {
  try {
    let version = await versionsData.findOne({
      testName: req.body.testName,
    });

    if (!version) {
      version = 1;
    } else {
      version = version.sentences.length + 1;
    }
    let updated;
    const score = await scoresData.findOne({
      userName: req.body.userName,
      testName: req.body.testName,
    });
    req.body.enteredSentence.version = version;
    if (score) {
      score.dates.push(req.body.dates);
      score.enteredSentence.push(req.body.enteredSentence);
      updated = await scoresData.findOneAndUpdate(
        {
          userName: req.body.userName,
          testName: req.body.testName,
        },
        score,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      req.body.dates = [req.body.dates];
      updated = await scoresData.create(req.body);
    }

    res.status(200).json({
      status: "success",
      updated,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.resultsNeededForFirstScorePage = async (req, res) => {
  try {
    const scores = await scoresData.find({ userName: req.params.userName });
    const tests = scores.map((el) => el.testName);
    const promises = [];
    tests.forEach((el) => {
      promises.push(testData.findOne({ testName: el }));
    });

    const dates = [];

    scores.forEach((el) => dates.push(el.dates.length));

    const allTests = await Promise.all(promises);
    let allTestCategories = await Promise.all(
      allTests.map(async (el) => {
        if (el) {
          const testCategory = await categoriesData.findOne({
            tests: { $in: [el.testName[0]] },
          });
          return testCategory.categoryName;
        }
      })
    );
    const newCategories = allTestCategories.map((el, i) => [el, i]);
    const newTests = tests.slice();

    newCategories.forEach((el, i) => {
      tests[i] = newTests[el[1]];
    });

    allTestCategories = newCategories.map((el) => el[0]);
    const data = allTestCategories.map((el, i) => {
      return {
        testCategory: el,
        testName: tests[i],
        noOfTimesTaken: dates[i],
      };
    });
    res.status(200).json({
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
exports.resultsNeededForSecondScorePage = async (req, res) => {
  try {
    const scores = await scoresData.findOne({
      userName: req.params.userName,
      testName: req.params.testName,
    });
    let version = await versionsData.findOne({
      testName: req.params.testName,
    });
    const score = (
      await testData.findOne({
        testName: { $in: [req.params.testName] },
      })
    ).indexes.flat().length;
    const data = scores.enteredSentence.map((el, i) => {
      !version || el.version === 1 || !version.numberOfWords[el.version - 2]
        ? (scoreOfTest = score)
        : version.numberOfWords[el.version - 1];
      return {
        date: scores.dates[i],
        score: `${el.score}/${scoreOfTest}`,
      };
    });
    res.status(200).json({
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

exports.resultsNeededForThirdScorePage = async (req, res) => {
  try {
    const score = await scoresData.findOne({
      testName: req.params.testName,
      userName: req.params.userName,
    });
    const version = await versionsData.findOne({
      testName: req.params.testName,
    });
    const test = await testData.findOne({
      testName: { $in: [req.params.testName] },
    });
    const arr = [];
    score.enteredSentence.forEach((el, i) => {
      let actualSentence;
      el.indexOfActualSentence.forEach((element, k) => {
        if (
          version &&
          element === version.indexOfActualSentence[el.version - 1]
        ) {
          actualSentence = version.sentence[el.version - 1];
        } else {
          actualSentence = test.sentences[element];
        }
        let mistakenSentence = actualSentence.slice();
        const split = mistakenSentence.split(" ");
        el.mistakenWords[k].forEach((_, j) => {
          const punctuationRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~“”‘’]/g;
          const punctuations = actualSentence
            .split(" ")
            [test.indexes[k][j]].match(punctuationRegex);
          split[test.indexes[element][j]] = `${el.mistakenWords[k][j]}${
            punctuations ? punctuations.join("") : ""
          }`;
        });
        mistakenSentence = split.flat().join(" ");
        arr.push({
          mistakenSentence,
          actualSentence,
          date: score.dates[i],
        });
      });
    });
    res.status(200).json({
      status: "success",
      data: arr,
      test,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
