"use strict";

import { baseUrl } from "../../../config.js";
import { logoutUser, sendAPI } from "../../../helpers/helpers.js";

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
      this.logout = document.querySelector(".logout-button");
      this.testName = decodeURIComponent(
        this.url
          .split("?")[1]
          .split("+")
          [this.url.split("?")[1].split("+").length - 1].trim()
      );
      this.addSpinner();
      this.renderData();
      this.removeSpinner();
      document
        .querySelector(".mistake-details")
        .addEventListener("click", this.handleClick.bind(this));
      this.logout.addEventListener("click", logoutUser.bind(this));
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
    this.containerHeader.insertAdjacentHTML(
      "beforeend",
      `${this.userName}'s ${this.testName} score details`
    );

    const data = (
      await sendAPI("GET", `${baseUrl}/score/${this.userName}/${this.testName}`)
    ).data;
    let str = ``;
    Object.keys(data[0]).forEach((el) => {
      str += `<div class="col-6">${
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
      Object.values(el).forEach((element) => {
        html += `<div class="col-6">${element}</div>`;
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
  handleClick(e) {
    let realUrl = this.url.split("?");
    const newOne = realUrl[0].split("/");
    newOne[newOne.indexOf("details-of-scores")] += "/mistake-details";
    realUrl[0] = newOne.join("/");
    window.open(realUrl.join("?"), "_blank");
  }
}

new App();
