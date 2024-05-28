"use strict";

import { baseUrl, sendAPI } from "../../../../config.js";
document.querySelector(".body").classList.add("hidden");
document.querySelector(".spinner").insertAdjacentHTML(
  "beforeend",
  `<div class="spinner-border text-info" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`
);

document.querySelector(".spinner").classList.add("hidden");
document.querySelector(".body").classList.remove("hidden");

class App {
  constructor() {
    (async () => {
      this.url = window.location.href;
      this.containerHeader = document.querySelector(".container-header");
      this.container = document.querySelector(".container");
      this.userName = decodeURIComponent(
        this.url
          .split("?")[1]
          .split("+")
          [this.url.split("?")[1].split("+").length - 2].trim()
      );

      this.testName = decodeURIComponent(
        this.url
          .split("?")[1]
          .split("+")
          [this.url.split("?")[1].split("+").length - 1].trim()
      );

      this.addSpinner();
      this.renderData();
      this.removeSpinner();
    })();
  }
  addSpinner() {
    document.querySelector(".body").classList.add("hidden");
    document.querySelector(".spinner").insertAdjacentHTML(
      "beforeend",
      `<div class="spinner-border text-info" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`
    );
  }
  async renderData() {
    const eveything = await sendAPI(
      "GET",
      `${baseUrl}/score/getMistakes/${this.userName}/${this.testName}`
    );

    const data = eveything.data;
    const test = eveything.test;

    if (data.length === 0) {
      return;
    }

    this.containerHeader.insertAdjacentHTML(
      "beforeend",
      `${this.userName}'s ${this.testName} score details`
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

    this.container.insertAdjacentHTML(
      "beforeend",
      `<div class="row">${str}</div>`
    );
    data.forEach((el) => {
      let html = ``;
      const indexes =
        test.indexes[test.sentences.indexOf(Object.values(el)[1])];
      Object.values(el).forEach((element, i) => {
        if (i !== 2) {
          element = element.split(" ");
          indexes.forEach((index) => {
            const punctuationRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~“”‘’]/g;
            let punctuations = element[index].match(punctuationRegex);
            punctuations = punctuations ? punctuations.join("") : "";
            element[index] = `<span class="highlight-column">${element[
              index
            ].replace(/([^\w\s])/g, "")}</span>${punctuations}`;
            if (index !== 0) {
              element[index - 1] += "&nbsp";
            }
          });
          element = element.join(" ");
        }
        html += `<div class="col-4">${element}</div>`;
      });
      this.container.insertAdjacentHTML(
        "beforeend",
        `<div class="row">${html}</div>`
      );
    });
  }
  removeSpinner() {
    document.querySelector(".spinner").classList.add("hidden");
    document.querySelector(".body").classList.remove("hidden");
  }
}

new App();
