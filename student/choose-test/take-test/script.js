"use strict";

import { baseUrl } from "../../../config.js";
import { sendAPI } from "../../../helpers/helpers.js";
import { default as DisplayingSpellings } from "../../../logics/displaying/spellings.js";
import { default as DisplayingSentenceCombining } from "../../../logics/displaying/sentence-combining.js";
import { default as DisplayingKeyTerms } from "../../../logics/displaying/keyterms.js";
class App {
  constructor() {
    (async () => {
      let testType;
      const allCategories = (await sendAPI("GET", `${baseUrl}/categories`)).data
        .data;
      allCategories.forEach((element) => {
        if (
          element.tests.includes(
            new URLSearchParams(window.location.search).get("testName")
          )
        ) {
          testType = element.type;
          return false;
        }
      });
      this.logout = document.querySelector(".logout-button");
      this.logout.addEventListener("click", this.#logoutToHome.bind(this));
      if (testType === "spellings") {
        new DisplayingSpellings();
      } else if (testType === "sentence-combining") {
        new DisplayingSentenceCombining();
      } else if (testType === "key-terms") {
        new DisplayingKeyTerms();
      }
    })();
  }
  #logoutToHome() {
    sendAPI("POST", `${baseUrl}/user/logout`);
    window.location.href = window.location.href.split("/student")[0];
  }
}

new App();
