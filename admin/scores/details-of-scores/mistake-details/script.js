"use strict";

import { baseUrl } from "../../../../config.js";
import { sendAPI } from "../../../../helpers/helpers.js";
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
      this.logoutButton = document.querySelector(".logout-button");
      this.logoutButton.addEventListener("click", this.logout);
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
  async logout() {
    document.cookie = `token=jwt; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    await sendAPI("POST", `${baseUrl}/user/logout`);
    window.location.href = window.location.href.split("/admin")[0];
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
      const answers =
        test.answers[test.sentences.indexOf(Object.values(el)[1])];
      Object.values(el).forEach((element, i) => {
        if (i !== 2) {
          element = element.split(" ");
          answers.forEach((index) => {
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
