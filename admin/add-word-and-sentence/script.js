"use strict";

import { default as Common } from "../../logics/adding/common.js";

class App {
  #heading;
  constructor() {
    (async () => {
      this.#heading = document.querySelector(".heading");
      this.#setHeading();
    })();
  }
  #setHeading() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataType = urlParams.get("dataType");
    this.#heading.textContent = decodeURIComponent(urlParams.get("testName"));
    new Common();
  }
}

new App();
