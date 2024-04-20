"use strict";

import { baseUrl, sendAPI } from "../../config.js";
const container = document.querySelector(".container");
const heading = document.querySelector(".heading");
const randomEvery = document.querySelector(".random-every");
let url = window.location.href;
const userName = url.split("?")[1];
heading.textContent = `${userName}'s tests`;
const testCategories = (await sendAPI("GET", `${baseUrl}/user`)).data.data.find(
  (element) => element.userName === userName
).testCategories;
const testCategoriesWithTests = (await sendAPI("GET", `${baseUrl}/categories`))
  .data.data;
document.addEventListener("click", function (e) {
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
});
testCategories.forEach((element) => {
  const tests = testCategoriesWithTests.find(
    (el) => el.categoryName === element
  ).tests;
  container.insertAdjacentHTML(
    "beforeend",
    `<div class="student" data-category-name="${element}">
  <div class="student-showing">
    <button class="show-button">+</button>
    <h2 class="student-name">${element}</h2>
  </div>
  <div class="contains hidden child">

  </div></div>`
  );
  const scores = container.lastElementChild;
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

container.addEventListener("click", function (e) {
  e.preventDefault();
  const randomButton = e.target.closest(".random");
  const row = e.target.closest(".row");
  if (row && !row.classList.contains("header")) {
    const categoryName = row.closest(".student").dataset.categoryName;
    const testName = row.querySelector(".test").textContent.trim();
    const query = url.split("?")[1] + "+" + categoryName + "+" + testName;
    const realUrl =
      url.split("?")[0].split("/student")[0] +
      randomEvery.getAttribute("href") +
      "?" +
      query;
    window.open(realUrl, "_blank");
  }
  if (randomButton) {
    const categoryName = randomButton.closest(".student").dataset.categoryName;
    const query = (url.split("?")[1] += `+${categoryName}`);
    const realUrl =
      url.split("?")[0].split("/student")[0] +
      randomButton.getAttribute("href") +
      "?" +
      query;
    window.open(realUrl, "_blank");
  }
});

randomEvery.addEventListener("click", function (e) {
  e.preventDefault();
  const query = url.split("?")[1];
  const realUrl =
    url.split("?")[0].split("/student")[0] +
    randomEvery.getAttribute("href") +
    "?" +
    query;
  window.open(realUrl, "_blank");
});

document.querySelector(".spinner-border").style.display = "none";
