"use strict";

import { baseUrl } from "../../config.js";
import { sendAPI } from "../../helpers.js";

class Adding {
  showingModal(input) {
    document.querySelector(".modal-body").textContent = "";
    const inputSentenceTest = input.value;

    const inputSentenceTestSplit = inputSentenceTest.split("\n");
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML("beforeend", `Sentence:<br>`);
    inputSentenceTestSplit.forEach((el) => {
      document
        .querySelector(".modal-body")
        .insertAdjacentHTML("beforeend", `${el}<br>`);
    });
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML(
        "beforeend",
        `Answer:<br><textarea class="answer"></textarea>`
      );

    document
      .querySelector(".btn-default")
      .addEventListener("click", (e) =>
        this.#saveSentenceAndAnswers(e, input, inputSentenceTest)
      );
  }

  async #saveSentenceAndAnswers(e, input, inputSentenceTest) {
    e.preventDefault();
    const typeOfChange = input
      .closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    const activeIndex = +input.closest(".row").dataset.index;
    const answer = document
      .querySelector(".answer")
      .value.split("\n")
      .map((el) => el.trim());

    if (typeOfChange === "adding") {
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${document
          .querySelector(".heading")
          .textContent.trim()}?typeOfChange=adding`,
        {}
      );
    } else {
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${document
          .querySelector(".heading")
          .textContent.trim()}?typeOfChange=${typeOfChange}&indexOfActualSentence=${activeIndex}`,
        {
          sentence: inputSentenceTest.trim(),
          answers: answer,
        }
      );
    }
    await sendAPI(
      "PATCH",
      `${baseUrl}/test/${
        document.querySelector(".heading").textContent
      }?currentIndex=${activeIndex}`,
      {
        sentences: inputSentenceTest,
        answers: answer,
      }
    );
    location.reload();
  }
}

export default Adding;
