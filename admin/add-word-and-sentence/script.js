"use strict";

import { logoutUser } from "../../helpers/helpers.js";
import { default as Common } from "../../logics/adding/common.js";

class App {
  #heading;
  #logout;
  constructor() {
    (async () => {
      this.#heading = document.querySelector(".heading");
      this.#logout = document.querySelector(".logout-button");
      this.#logout.addEventListener("click", logoutUser.bind(this));
      this.#setHeading();
    })();
  }
  #setHeading() {
    const urlParams = new URLSearchParams(window.location.search);
    this.#heading.textContent = decodeURIComponent(urlParams.get("testName"));
    new Common();
  }
}

new App();
