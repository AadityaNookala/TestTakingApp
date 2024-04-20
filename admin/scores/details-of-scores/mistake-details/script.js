"use strict";

import { baseUrl, sendAPI } from "../../../../config.js";
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

const data = (
  await sendAPI("GET", `${baseUrl}/score/getMistakes/${userName}/${testName}`)
).data;

containerHeader.insertAdjacentHTML(
  "beforeend",
  `${userName}'s ${testName} score details`
);

let str = ``;

Object.keys(data[0]).forEach((el) => {
  str += `<div class="col-4">${
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
    html += `<div class="col-4">${element}</div>`;
  });
  container.insertAdjacentHTML("beforeend", `<div class="row">${html}</div>`);
});
document.querySelector(".spinner").classList.add("hidden");
document.querySelector(".body").classList.remove("hidden");
