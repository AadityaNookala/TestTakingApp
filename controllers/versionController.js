const scoresData = require("../models/scoreModel.js");
const testData = require("../models/testModel.js");
const versionsData = require("../models/versionModel.js");
exports.createOrEditVersion = async (req, res) => {
  try {
    let version = await versionsData.findOne({ testName: req.params.testName });
    if (!version) {
      res.status(200).json({
        status: "success",
        data: "Did not create versions document",
      });
      return;
    }
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
      message: err.message,
    });
  }
};
