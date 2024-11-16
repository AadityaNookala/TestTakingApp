"use strict";

import { baseUrl } from "../../config.js";
import { sendAPI } from "../../helpers/helpers.js";

class CommonKTSP {
  async sendForKeyTermsAndSpellings(
    data,
    typeOfChange,
    activeIndex,
    inputSentenceTest = null
  ) {
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
