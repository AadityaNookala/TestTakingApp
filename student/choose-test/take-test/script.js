"use strict";

import { baseUrl, sendAPI } from "../../../config.js";
import { default as DisplayingSpellings } from "../../../logics/displaying/spellings.js";
import { default as DisplayingSentenceCombining } from "../../../logics/displaying/sentence-combining.js";
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
      if (testType === "spellings") {
        new DisplayingSpellings();
      } else if (testType === "sentence-combining") {
        new DisplayingSentenceCombining();
      }
    })();
  }
}

new App();
