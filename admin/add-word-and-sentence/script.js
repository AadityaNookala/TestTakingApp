"use strict";

import { default as AP } from "../../logics/adding/ap.js";
import { default as CommonSPSC } from "../../logics/adding/commonspsc.js";

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
    if (dataType === "spellings" || dataType === "sentence-combining") {
      new CommonSPSC();
    } else if (dataType === "ap") {
      new AP();
    }
  }
}

new App();
