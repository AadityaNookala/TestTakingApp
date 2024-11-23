const WordNet = require("node-wordnet");
const lemmatizer = require("node-lemmatizer");
const { Storage } = require("@google-cloud/storage");
const crypto = require("crypto");

const wordnet = new WordNet("./node_modules/wordnet-db/dict");
const categoriesData = require("../models/categoryModel.js");
const scoresData = require("../models/scoreModel.js");
const testData = require("../models/testModel.js");
const usersData = require("../models/userModel.js");
const versionsData = require("../models/versionModel.js");

const storage = new Storage();
const bucket = storage.bucket(process.env.BUCKET_NAME);

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
      message: err.message,
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
      message: err.message,
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
      type: "spellings",
    });
    data.tests.forEach(async (el) => {
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
      message: err.message,
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
    const newCategory = await categoriesData.findOne({
      categoryName: req.body.newCategoryName,
    });
    if (!newCategory) {
      await categoriesData.create({
        categoryName: req.body.newCategoryName,
        isClone: false,
        withMeanings: oldCategory.withMeanings,
        type: "spellings",
      });
    }
    const categoryTests = await Promise.all(
      dataAboutTests.map(async (el, i) => {
        const test = await testData.findOne({
          testName: { $in: [newCategory?.tests[i]] },
        });
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

        let newTestName;
        if (oldCategory.withMeanings) {
          newTestName = `${oldCategory.tests[i]} NoCluesDictionary`;
        } else {
          newTestName = `${oldCategory.tests[i]} NoCluesNoDictionary`;
        }
        if (test) {
          await testData.findOneAndUpdate(
            {
              testName: [newTestName],
            },
            { $set: { sentences: actualSentences, answers: actualIndexes } }
          );
        } else {
          await testData.create({
            testName: [newTestName],
            sentences: actualSentences,
            answers: actualIndexes,
          });
        }
        return newTestName;
      })
    );
    await categoriesData.findOneAndUpdate(
      { categoryName: req.body.newCategoryName },
      { $set: { tests: categoryTests, isClone: true } }
    );
    res.status(200).json({
      status: "success",
      data: "Done",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getSignedUrl = async (req, res) => {
  const imageId = crypto.randomUUID();
  const fileName = `${req.query.fileName}-${imageId}`;
  const options = {
    version: "v4",
    action: "write",
    expires: Date.now() + 1 * 60 * 1000,
    contentType: "application/octet-stream",
  };

  try {
    const [url] = await bucket.file(fileName).getSignedUrl(options);
    const imageUrl = process.env.IMAGE_BASE_URL.replace(
      "<BUCKET_NAME>",
      process.env.BUCKET_NAME
    ).replace("<FILE_NAME>", fileName);
    res.status(200).json({ status: "success", signedUrl: url, imageUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res
      .status(400)
      .json({ status: "fail", message: "Error generating signed URL" });
  }
};
