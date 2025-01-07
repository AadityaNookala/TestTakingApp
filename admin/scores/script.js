"use strict";

import { baseUrl } from "../../config.js";
import { logoutUser, sendAPI } from "../../helpers/helpers.js";
class App {
  constructor() {
    (async () => {
      this.url = window.location.href;
      this.containerHeader = document.querySelector(".container-header");
      this.container = document.querySelector(".container");
      this.logout = document.querySelector(".logout-button");
      this.addSpinner();
      this.renderData();
      this.removeSpinner();
      this.container.addEventListener("click", this.handleClick.bind(this));
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
    const userName = this.url
      .split("?")[1]
      .split("+")
      [this.url.split("?")[1].split("+").length - 1].trim();
    this.containerHeader.textContent = `${userName}'s Test Summary`;
    const data = (await sendAPI("GET", `${baseUrl}/score/${userName}`)).data;
    if (data.length === 0) {
      return;
    }
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
    this.container.insertAdjacentHTML(
      "beforeend",
      `<div class="row">${str}</div>`
    );
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
    const details = e.target.closest(".details");
    if (!details) return;
    const testName = details
      .closest(".row")
      .querySelector(".test-name")
      .textContent.trim();
    let realUrl = this.url.split("?");
    const newOne = realUrl[0].split("/");
    newOne[newOne.indexOf("scores")] += "/details-of-scores";
    realUrl[0] = newOne.join("/");
    realUrl[1] += `+${testName}`;
    window.open(realUrl.join("?"), "_blank");
  }
}

new App();
