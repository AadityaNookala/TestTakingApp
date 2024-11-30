import { baseUrl, baseUrlScheduler } from "../../config.js";
import { sendAPI } from "../../helpers/helpers.js";
class Common {
  constructor() {
    this.url = new URLSearchParams(window.location.search);
  }
  async getRandomTest() {
    const heading = document.querySelector(".heading");
    this.randomTest = (
      await sendAPI(
        "GET",
        `${baseUrl}/test/${this.url.get("testName")}/${new URLSearchParams(
          window.location.search
        ).get("testCategory")}`
      )
    ).data.test;
    heading.textContent = `${this.url.get("testName")} test`;
  }
  async sendAPIToScoresAndScheduler(
    enteredAnswers,
    indexOfMistake,
    score,
    noOfWords
  ) {
    const date = new Date();
    const dateMonthDayYear =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    const testName = this.randomTest.testName;
    const userName = this.url.get("accessLevel");
    const categoryName = this.url.get("testCategory");
    await sendAPI("PATCH", `${baseUrl}/score`, {
      userName: userName,
      testName: testName,
      dates: dateMonthDayYear,
      enteredSentence: {
        indexOfActualSentence: indexOfMistake,
        mistakenAnswers: enteredAnswers,
        score,
      },
    });
    if (userName !== "Shandilya" && userName !== "Aaditya") return;
    const allTestsInCategory = (
      await sendAPI("GET", `${baseUrl}/categories/getCategory/${categoryName}`)
    ).data.data.tests;
    const nextTask =
      allTestsInCategory[allTestsInCategory.indexOf(testName) + 1];
    score = `${score}/${noOfWords}`;

    await sendAPI("POST", `${baseUrlScheduler}/integrate-spellings-app`, {
      score,
      testName,
      categoryName,
      nextTask,
      userName,
    });
  }
}

export default Common;
