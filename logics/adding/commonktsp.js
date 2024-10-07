"use strict";

import { baseUrl, sendAPI } from "../../config.js";

class CommonKTSP {
  async sendForKeyTermsAndSpellings(arrOfIndexes, typeOfChange, activeIndex) {
    const data = Object.fromEntries([
      ...new FormData(document.querySelector("form")),
    ]);
    data.answers = arrOfIndexes;

    if (typeOfChange === "adding") {
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${document
          .querySelector(".heading")
          .textContent.trim()}?typeOfChange=${typeOfChange}`,
        {}
      );
    } else {
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${document
          .querySelector(".heading")
          .textContent.trim()}?typeOfChange=${typeOfChange}&indexOfActualSentence=${activeIndex}`,
        {
          sentence: inputSentenceTest.join(""),
          answers: arrOfIndexes,
        }
      );
    }
    await sendAPI(
      "PATCH",
      `${baseUrl}/test/${
        document.querySelector(".heading").textContent
      }?currentIndex=${activeIndex}`,
      data
    );
    location.reload();
  }
}

export default CommonKTSP;
