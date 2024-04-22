const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const WordNet = require("node-wordnet");
const lemmatizer = require("node-lemmatizer");
const app = express();
const wordnet = new WordNet("./node_modules/wordnet-db/dict");
app.use(cors());
app.use(express.json());
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log("DB connection successful"));

const port = 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const testSchema = new mongoose.Schema({
  testName: {
    type: Array,
    required: true,
  },
  sentences: {
    type: Array,
    required: true,
  },
  indexes: {
    type: Array,
    required: true,
  },
});

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

const scoresSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  testName: {
    type: String,
    required: true,
  },
  dates: {
    type: Array,
    required: true,
  },
  enteredSentence: {
    type: [
      {
        indexOfActualSentence: { type: Array, required: true },
        mistakenWords: { type: Array, required: true },
        score: { type: Number, required: true },
        version: { type: Number, required: true, default: 1 },
      },
    ],
    required: true,
  },
});

const versionsSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
  },
  sentences: {
    type: Array,
    required: true,
  },
  indexes: {
    type: Array,
    required: true,
  },
  numberOfWords: {
    type: Array,
    required: true,
  },
  indexOfActualSentence: {
    type: Array,
    required: true,
  },
});

const testData = new mongoose.model("test", testSchema);
const usersData = new mongoose.model("user", usersSchema);
const categoriesData = new mongoose.model("category", categoriesSchema);
const scoresData = new mongoose.model("score", scoresSchema);
const versionsData = new mongoose.model("version", versionsSchema);

app.get("/word-meaning/:word", async (req, res) => {
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
});

app.get("/random/:userName", async (req, res) => {
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
});

app.patch("/update/:oldTestName/:categoryName", async (req, res) => {
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
});

app.patch("/updateTestCategory/:oldTestCategoryName", async (req, res) => {
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
});

app.post("/update/clone/:oldCategoryName", async (req, res) => {
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
});

app.post("/remove-clues", async (req, res) => {
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
        let hi;
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
});

app.get("/categories", async (req, res) => {
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
});

app.get("/categories/:testName", async (req, res) => {
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
});

app.get("/categories/isclone/:categoryName", async (req, res) => {
  const clone = await categoriesData.findOne({
    categoryName: req.params.categoryName,
  });
  res.status(200).json({
    status: "success",
    data: {
      clone: clone,
    },
  });
});

app.get("/categories/clone/:categoryName", async (req, res) => {
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
});

app.post("/categories", async (req, res) => {
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
});

app.patch("/categories/:categoryName", async (req, res) => {
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
});

app.patch("/score", async (req, res) => {
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
});

app.get("/score/:userName", async (req, res) => {
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
});
app.get("/score/:userName/:testName", async (req, res) => {
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
});

app.get("/score/getMistakes/:userName/:testName", async (req, res) => {
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
});

app.get("/test/:testName", async (req, res) => {
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
});

app.post("/test/:categoryName", async (req, res) => {
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
});

app.patch("/test/:testName", async (req, res) => {
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
});

app.patch("/test/:oldTestName/:categoryName", async (req, res) => {
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
});

app.post("/user", async (req, res) => {
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
});

app.get("/user", async (req, res) => {
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
});

app.get("/user/:userName", async (req, res) => {
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
});

app.patch("/user/:userName", async (req, res) => {
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
});

app.patch("/version/:testName", async (req, res) => {
  try {
    let version = await versionsData.findOne({ testName: req.params.testName });
    const numberOfWords = (
      await testData.findOne({ testName: req.params.testName })
    ).indexes.flat().length;

    const score = (
      await scoresData.find({ testName: req.params.testName })
    ).flatMap((el) => el.enteredSentence);
    let flag = false;
    if (req.query.typeOfChange === "editing") {
      for (let i = 0; i < score.length; i++) {
        if (
          score[i].indexOfActualSentence.includes(
            req.query.indexOfActualSentence
          )
        ) {
          flag = true;
          break;
        } else {
          flag = false;
        }
      }
      if (!flag) {
        res.status(200).json({
          status: "success",
          data: "Did not create versions document",
        });
        return;
      }
    }

    if (score.length === 0) {
      res.status(200).json({
        status: "success",
        data: "Did not create versions document",
      });
      return;
    }

    if (!version) {
      const data = {
        testName: req.params.testName,
        sentences: null,
        indexes: null,
        numberOfWords: null,
        indexOfActualSentence: null,
      };
      if (req.query.typeOfChange === "adding") {
        data.numberOfWords = [numberOfWords];
        data.sentences = [null];
        data.indexes = [null];
        data.indexOfActualSentence = [null];
      } else {
        data.sentences = [req.body.sentence];
        data.indexes = [req.body.indexes];
        data.numberOfWords = [null];
        data.indexOfActualSentence = [+req.query.indexOfActualSentence];
      }
      await versionsData.create(data);
      res.status(200).json({
        status: "success",
        data: null,
      });
      return;
    } else {
      if (
        score.filter((el) => el.version - 1 === version.sentences.length)
          .length === 0
      ) {
        res.status(200).json({
          status: "success",
          data: "Did not create versions document",
        });
        return;
      }
      if (req.query.typeOfChange === "adding") {
        version.numberOfWords.push(numberOfWords);
        version.sentences.push(null);
        version.indexes.push(null);
        version.indexOfActualSentence.push(null);
      } else {
        const studentMadeMistake = score
          .filter((el) => el.version - 1 === version.sentences.length)
          .flatMap((obj) => obj.indexOfActualSentence)
          .includes(req.query.indexOfActualSentence);
        if (!studentMadeMistake) {
          res.status(200).json({
            status: "success",
            data: "Did not create versions document",
          });
          return;
        }

        version.numberOfWords.push(null);
        version.sentences.push(req.body.sentence);
        version.indexes.push(req.body.indexes);
        version.indexOfActualSentence.push(
          +req.query.indexOfActualSentence.trim()
        );
      }
      await versionsData.findOneAndUpdate(
        {
          testName: req.params.testName,
        },
        version,
        {
          new: true,
          runValidators: true,
        }
      );
    }
    res.status(200).json({
      status: "success",
      data: version,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
});
