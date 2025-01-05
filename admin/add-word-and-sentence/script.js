"use strict";

import { baseUrl } from "../../config.js";
import { sendAPI } from "../../helpers/helpers.js";
import { default as Common } from "../../logics/adding/common.js";

class App {
  #heading;
  #logout;
  constructor() {
    (async () => {
      this.#heading = document.querySelector(".heading");
      this.#logout = document.querySelector(".logout-button");
      this.#logout.addEventListener("click", this.#logoutToHome.bind(this));
      this.#setHeading();
    })();
  }
  #setHeading() {
    const urlParams = new URLSearchParams(window.location.search);
    this.#heading.textContent = decodeURIComponent(urlParams.get("testName"));
    new Common();
  }

  async #logoutToHome() {
    document.cookie = `token=jwt; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    await sendAPI("POST", `${baseUrl}/user/logout`);
    window.location.href = window.location.href.split("/admin")[0];
  }
}

new App();
