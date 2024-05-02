const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const WordNet = require("node-wordnet");
const lemmatizer = require("node-lemmatizer");
const wordnet = new WordNet("./node_modules/wordnet-db/dict");
const categoriesData = require("../models/categoryModel.js");
const scoresData = require("../models/scoreModel.js");
const testData = require("../models/testModel.js");
const usersData = require("../models/userModel.js");
const versionsData = require("../models/versionModel.js");

exports.getMeaning = async (req, res) => {
  const lemmas = lemmatizer.only_lemmas(req.params.word);
  const lookupAsync = async function (word) {
    return new Promise((resolve, reject) => {
      wordnet.lookup(word, async (results) => {
        arr = results.map((el) => {
          return {
            definition: el.def,
            sentences: el.exp,
            partOfSpeech: el.pos,
            synonyms: el.synonyms,
          };
        });
        resolve(arr);
      });
    });
  };
  const data = (
    await Promise.all(lemmas.map((lemma) => lookupAsync(lemma)))
  ).flat();
  res.status(200).json({
    status: "success",
    data,
  });
};

exports.randomTest = async (req, res) => {
  try {
    let tests;
    if (req.query.categoryName) {
      tests = (
        await categoriesData.findOne({
          categoryName: req.query.categoryName,
        })
      ).tests;
    } else {
      const user = await usersData.findOne({ userName: req.params.userName });
      tests = (
        await Promise.all(
          user.testCategories.map(
            async (el) =>
              (
                await categoriesData.findOne({ categoryName: el })
              ).tests
          )
        )
      ).flat();
    }
    const index = Math.trunc(Math.random() * tests.length);
    const testName = tests[index];
    let test = await testData.findOne({
      testName: { $in: [testName] },
    });
    test = test.toObject();
    test.testName = testName;
    res.status(201).json({
      status: "success",
      test,
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
    const data = await testData.findOne({
      testName: req.params.oldTestName,
    });
    data.testName[data.testName.indexOf(req.params.oldTestName)] =
      req.body.testName;
    await testData.findOneAndUpdate(
      {
        testName: req.params.oldTestName,
      },
      { $set: { testName: data.testName } },
      {
        new: true,
        runValidators: true,
      }
    );
    const tests = (
      await categoriesData.findOne({
        categoryName: req.params.categoryName,
      })
    ).tests;
    tests[tests.indexOf(req.params.oldTestName)] = req.body.testName;
    await categoriesData.findOneAndUpdate(
      {
        categoryName: req.params.categoryName,
      },
      { $set: { tests } },
      {
        new: true,
        runValidators: true,
      }
    );
    const version = versionsData.findOne({ testName: req.params.oldTestName });
    if (!version) {
      res.status(201).json({
        status: "success",
        data: null,
      });
      return;
    }
    await versionsData.findOneAndUpdate(
      {
        testName: req.params.oldTestName,
      },
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );
    const scores = await scoresData.find({
      testName: req.params.oldTestName,
    });
    scores.forEach(async (el) => {
      await scoresData.findOneAndUpdate(
        {
          testName: req.params.oldTestName,
          userName: el.userName,
        },
        { $set: req.body },
        {
          new: true,
          runValidators: true,
        }
      );
    });
    res.status(201).json({
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

exports.editTestCategoryName = async (req, res) => {
  try {
    await categoriesData.findOneAndUpdate(
      {
        categoryName: req.params.oldTestCategoryName,
      },
      { $set: { categoryName: req.body.testCategory } },
      {
        new: true,
        runValidators: true,
      }
    );
    const users = await usersData.find();
    users.forEach(async (el) => {
      if (el.testCategories.includes(req.params.oldTestCategoryName)) {
        el.testCategories[
          el.testCategories.indexOf(req.params.oldTestCategoryName)
        ] = req.body.testCategory;
        await usersData.findOneAndUpdate(
          {
            userName: el.userName,
          },
          { $set: { testCategories: el.testCategories } },
          { new: true, runValidators: true }
        );
      }
    });
    res.status(201).json({
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

exports.clone = async (req, res) => {
  try {
    const data = await categoriesData.findOne({
      categoryName: req.params.oldCategoryName,
    });
    const arr = data.tests.map((el) => el + " " + req.body.tests);
    await categoriesData.create({
      categoryName: req.body.categoryName,
      tests: arr,
      withMeanings: req.body.withMeanings,
      isClone: req.body.isClone,
    });
    data.tests.forEach(async (el, i) => {
      let test = (
        await testData.findOne({
          testName: { $in: [el] },
        })
      ).toObject();
      const oldTestName = test.testName[0].slice();
      test.testName.push(oldTestName + " " + req.body.tests);
      await testData.findOneAndUpdate(
        { testName: oldTestName },
        { $set: { testName: test.testName } }
      );
    });
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

exports.removeClues = async (req, res) => {
  try {
    const tests = (
      await categoriesData.findOne({
        categoryName: req.body.oldCategoryName,
      })
    ).toObject().tests;
    const dataAboutTests = await Promise.all(
      tests.map(async (test) =>
        (
          await testData.findOne({
            testName: { $in: [test] },
          })
        ).toObject()
      )
    );
    const oldCategory = await categoriesData.findOne({
      categoryName: req.body.oldCategoryName,
    });
    await categoriesData.create({
      categoryName: req.body.newCategoryName,
      isClone: false,
      withMeanings: oldCategory.withMeanings,
    });
    const categoryTests = [];
    dataAboutTests.forEach(async (el, i) => {
      const actualIndexes = [];
      const actualSentences = [];
      el.sentences.forEach((element) => {
        const indexes = [];
        let flag = false;
        let str = "";
        let count = 0;
        let puncs = "";
        const arrOfPuncs = [
          ",",
          ".",
          "!",
          "?",
          ":",
          ";",
          "“",
          "”",
          '"',
          "‘",
          "`",
          "’",
        ];
        element.split(" ").forEach((el, j) => {
          if (el[0] === "(") {
            indexes.push(count - 1);
            flag = true;
          }
          if (flag) {
            if (el.includes(")")) {
              arrOfPuncs.forEach((punc) => {
                if (el.includes(punc)) {
                  puncs += punc;
                  if (punc === ".") {
                    hi = ".";
                  }
                }
              });
              flag = false;
            }
          } else {
            if (puncs === "") {
              str += `${el} `;
            } else {
              str = str.slice(0, -1);
              str += `${puncs} ${el} `;
            }
            puncs = "";
            count++;
          }
          if (j === element.split(" ").length - 1) {
            str = str.trim();
            str += ".";
          }
        });
        actualIndexes.push(indexes);
        actualSentences.push(str.trim());
      });
      console.log(actualSentences);
      let newTestName;
      if (oldCategory.withMeanings) {
        newTestName = `${oldCategory.tests[i]} NoCluesDictionary`;
      } else {
        newTestName = `${oldCategory.tests[i]} NoCluesNoDictionary`;
      }
      categoryTests.push(newTestName);
      await testData.create({
        testName: [newTestName],
        sentences: actualSentences,
        indexes: actualIndexes,
      });
    });
    await categoriesData.findOneAndUpdate(
      { categoryName: req.body.newCategoryName },
      { $set: { tests: categoryTests } }
    );
    res.status(200).json({
      status: "success",
      data: "Done",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
