"use strict";

import { baseUrl, sendAPI } from "../../config.js";

class CommonKTSP {
  async sendForKeyTermsAndSpellings(
    data,
    typeOfChange,
    activeIndex,
    inputSentenceTest = null
  ) {
    console.log(inputSentenceTest);
    if (typeOfChange === "adding") {
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${document
          .querySelector(".heading")
          .textContent.trim()}?typeOfChange=${typeOfChange}`,
        {}
      );
    } else {
      const sendObj = {
        answers: data.answers,
      };
      if (inputSentenceTest) sendObj.sentence = inputSentenceTest.join("");
      else sendObj.sentence = data.imageUrl;
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${document
          .querySelector(".heading")
          .textContent.trim()}?typeOfChange=${typeOfChange}&indexOfActualSentence=${activeIndex}`,
        sendObj
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
