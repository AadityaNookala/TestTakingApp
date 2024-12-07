const categoriesData = require("../models/categoryModel.js");
const testData = require("../models/testModel.js");
exports.getTest = async (req, res) => {
  try {
    let test = await testData.findOne({
      testName: { $in: [req.params.testName] },
    });
    const category = await categoriesData.findOne({
      categoryName: req.params.testCategory,
    });

    test = test.toObject();
    test.testName = req.params.testName;
    let sum = 0;
    const type = category.type;
    if (type === "spellings") {
      test.answers.forEach((el) => (sum += el.length));
    } else {
      test.answers.forEach((answer, i) => {
        const oldSentence = test.sentences[i].sentence;
        if (oldSentence) {
          const sentence = oldSentence.split(" ");
          for (let j = 0; j < sentence.length - 1; j += 2)
            sentence.splice(j + 1, 0, " ");
          const storedAnswer = [];
          let word = "";
          for (let j = 0; j < answer.length; j++) {
            word += sentence[answer[j]];
            if (answer[j] !== answer[j + 1] - 1) {
              storedAnswer.push(word);
              word = "";
            }
          }
          sum += storedAnswer.length;
        } else {
          sum += answer.length;
        }
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        test,
        count: sum,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
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
          if (!Array.isArray(response[key])) return;
          response[key].push(req.body[key]);
        });
      } else {
        Object.keys(response.toJSON()).forEach((key) => {
          if (!Array.isArray(response[key])) return;
          response[key][+req.query.currentIndex] = req.body[key];
        });
      }
      response = await testData.updateOne(filter, { $set: response });
    } else {
      response = await testData.findOneAndUpdate(
        { testName: { $in: [req.params.testName] } },
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
      message: err.message,
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
      message: err.message,
    });
  }
};

exports.updateTestForScores = async (req, res) => {
  try {
    await testData.findOneAndUpdate(
      { testName: req.body.test.testName },
      req.body.test
    );
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
