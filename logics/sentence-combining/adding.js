"use strict";

import { baseUrl, sendAPI, arrOfPuncs } from "../../config.js";

class Adding {
  showingModal() {
    const typeOfChange = this.closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    document.querySelector(".modal-body").textContent = "";
    const inputSentenceTest = this.value;
    const activeIndex = +this.closest(".row").dataset.index;
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
      .addEventListener("click", async function (e) {
        e.preventDefault();
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
              answers: arrayOfSpans,
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
      });
  }
}

export default Adding;
