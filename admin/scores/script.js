"use strict";

import { baseUrl, sendAPI } from "../../config.js";
document.querySelector(".body").classList.add("hidden");
document.querySelector(".spinner").insertAdjacentHTML(
  "beforeend",
  `<div class="spinner-border text-info" role="status">
<span class="visually-hidden">Loading...</span>
</div>`
);
const url = window.location.href;
const containerHeader = document.querySelector(".container-header");
const userName = url
  .split("?")[1]
  .split("+")
  [url.split("?")[1].split("+").length - 1].trim();
containerHeader.textContent = `${userName}'s Test Summary`;
const container = document.querySelector(".container");
const data = (await sendAPI("GET", `${baseUrl}/score/${userName}`)).data;
let str = ``;
Object.keys(data[0]).forEach((el) => {
  str += `<div class="col-3">${
    el
      .replace(/([A-Z])/g, " $1")
      .charAt(0)
      .toUpperCase() + el.replace(/([A-Z])/g, " $1").slice(1)
  }</div>`;
});
str += `<div class="col-3">Details</div>`;
container.insertAdjacentHTML("beforeend", `<div class="row">${str}</div>`);
data.forEach((element) => {
  let html = ``;
  Object.values(element).forEach((el, i) => {
    Object.keys(element)[i] === "testName"
      ? (html += `
    <div class="col-3 test-name">${el}</div>`)
      : (html += `
    <div class="col-3">${el}</div>`);
  });
  html += `<div class="col-3"><button class="details">Details</button></div>`;
  container.insertAdjacentHTML("beforeend", `<div class="row">${html}</div>`);
});

container.addEventListener("click", function (e) {
  const details = e.target.closest(".details");
  if (!details) return;
  const testName = details
    .closest(".row")
    .querySelector(".test-name")
    .textContent.trim();
  const url = window.location.href;
  let realUrl = url.split("?");
  const newOne = realUrl[0].split("/");
  newOne[newOne.indexOf("scores")] += "/details-of-scores";
  realUrl[0] = newOne.join("/");
  realUrl[1] += `+${testName}`;
  window.open(realUrl.join("?"), "_blank");
});

document.querySelector(".spinner").classList.add("hidden");
document.querySelector(".body").classList.remove("hidden");
