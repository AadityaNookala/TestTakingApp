"use strict";

import { baseUrl, sendAPI } from "../../../config.js";
document.querySelector(".body").classList.add("hidden");
document.querySelector(".spinner").insertAdjacentHTML(
  "beforeend",
  `<div class="spinner-border text-info" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`
);

const url = window.location.href;
const containerHeader = document.querySelector(".container-header");
const container = document.querySelector(".container");
const userName = decodeURIComponent(
  url.split("?")[1].split("+")[url.split("?")[1].split("+").length - 2].trim()
);

const testName = decodeURIComponent(
  url.split("?")[1].split("+")[url.split("?")[1].split("+").length - 1].trim()
);

containerHeader.insertAdjacentHTML(
  "beforeend",
  `${userName}'s ${testName} score details`
);

const data = (await sendAPI("GET", `${baseUrl}/score/${userName}/${testName}`))
  .data;
let str = ``;
Object.keys(data[0]).forEach((el) => {
  str += `<div class="col-6">${
    el
      .replace(/([A-Z])/g, " $1")
      .charAt(0)
      .toUpperCase() + el.replace(/([A-Z])/g, " $1").slice(1)
  }</div>`;
});
container.insertAdjacentHTML("beforeend", `<div class="row">${str}</div>`);
data.forEach((el) => {
  let html = ``;
  Object.values(el).forEach((element) => {
    html += `<div class="col-6">${element}</div>`;
  });
  container.insertAdjacentHTML("beforeend", `<div class="row">${html}</div>`);
});
document.querySelector(".spinner").classList.add("hidden");
document.querySelector(".body").classList.remove("hidden");

document
  .querySelector(".mistake-details")
  .addEventListener("click", function () {
    const url = window.location.href;
    let realUrl = url.split("?");
    const newOne = realUrl[0].split("/");
    newOne[newOne.indexOf("details-of-scores")] += "/mistake-details";
    realUrl[0] = newOne.join("/");
    window.open(realUrl.join("?"), "_blank");
  });
