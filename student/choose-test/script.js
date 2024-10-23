"use strict";

import { baseUrl } from "../../config.js";
import { sendAPI } from "../../helpers.js";
class App {
  constructor() {
    (async () => {
      this.container = document.querySelector(".container");
      this.heading = document.querySelector(".heading");
      this.randomEvery = document.querySelector(".random-every");
      this.url = window.location.href;
      await this.renderData();
      document.addEventListener("click", this.showButton.bind(this));
      this.container.addEventListener(
        "click",
        this.handleClickOnTestAndOnCategoryRandom.bind(this)
      );
      this.randomEvery.addEventListener(
        "click",
        this.handleClickOnRandomEvery.bind(this)
      );
    })();
  }
  async renderData() {
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get("accessLevel");
    this.heading.textContent = `${userName}'s tests`;
    const testCategories = (
      await sendAPI("GET", `${baseUrl}/user`)
    ).data.data.find((element) => element.userName === userName).testCategories;
    const testCategoriesWithTests = (
      await sendAPI("GET", `${baseUrl}/categories`)
    ).data.data;
    testCategories.forEach((element) => {
      const tests = testCategoriesWithTests.find(
        (el) => el.categoryName === element
      ).tests;
      this.container.insertAdjacentHTML(
        "beforeend",
        `<div class="student" data-category-name="${element}">
  <div class="student-showing">
    <button class="show-button">+</button>
    <h2 class="student-name">${element}</h2>
  </div>
  <div class="contains hidden child">

  </div></div>`
      );
      const scores = this.container.lastElementChild;
      const contains = scores.querySelector(".contains");
      contains.insertAdjacentHTML(
        "beforeend",
        `<div class="row header">
    <div class="no">
      #
    </div>
    <div class="test">
      Test Name
    </div>
  </div>`
      );
      tests.forEach((element, i) => {
        contains.insertAdjacentHTML(
          "beforeend",
          `<div class="row">
    <div class="no">
      ${i + 1}
    </div>
    <div class="test">
      ${element}
    </div>
  </div>`
        );
      });
      contains.insertAdjacentHTML(
        "beforeend",
        `  <a type="button" class="random" href="/student/choose-test/take-test/index.html">Take a random one for ${element}</a> `
      );
    });
    document.querySelector(".spinner-border").style.display = "none";
  }
  showButton(e) {
    const showButton = e.target.closest(".show-button");
    if (!showButton) return;
    showButton.parentElement.parentElement
      .querySelector(".child")
      .classList.toggle("hidden");
    if (showButton.textContent === "+") {
      showButton.textContent = "-";
    } else {
      showButton.textContent = "+";
    }
  }
  handleClickOnTestAndOnCategoryRandom(e) {
    e.preventDefault();
    const randomButton = e.target.closest(".random");
    const row = e.target.closest(".row");
    if (row && !row.classList.contains("header")) {
      const categoryName = row.closest(".student").dataset.categoryName;
      const testName = row.querySelector(".test").textContent.trim();
      const query =
        this.url.split("?")[1] +
        "&testCategory=" +
        categoryName +
        "&testName=" +
        testName;
      const realUrl =
        this.url.split("?")[0].split("/student")[0] +
        this.randomEvery.getAttribute("href") +
        "?" +
        query;
      window.open(realUrl, "_blank");
    }
    if (randomButton) {
      const categoryName =
        randomButton.closest(".student").dataset.categoryName;
      const query = (this.url.split("?")[1] += `&testCategory=${categoryName}`);
      const realUrl =
        this.url.split("?")[0].split("/student")[0] +
        randomButton.getAttribute("href") +
        "?" +
        query;
      window.open(realUrl, "_blank");
    }
  }
  handleClickOnRandomEvery(e) {
    e.preventDefault();
    const query = this.url.split("?")[1];
    const realUrl =
      this.url.split("?")[0].split("/student")[0] +
      this.randomEvery.getAttribute("href") +
      "?" +
      query;
    window.open(realUrl, "_blank");
  }
}

new App();
