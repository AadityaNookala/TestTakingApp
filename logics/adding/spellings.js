"use strict";

import { arrOfPuncs } from "../../config.js";
import { default as CommonKTSP } from "./commonktsp.js";

class Adding {
  showingModal(input) {
    document.querySelector(".modal-body").textContent = "";
    const inputSentenceTest = input.value;
    const inputSentenceTestSplit = inputSentenceTest.split(" ");
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML("beforeend", `Sentence:   `);
    let count = 0;
    inputSentenceTestSplit.forEach(function (s, i) {
      const bool = arrOfPuncs.some((punc) => s.includes(punc));
      let punc = "";
      let punc2 = "";
      if (bool) {
        const arr = s.split("");
        for (; arrOfPuncs.includes(arr[arr.length - 1]); ) {
          punc += arr.pop();
        }
        for (; arrOfPuncs.includes(arr[0]); ) {
          punc2 += arr.shift();
        }
        s = arr.join("");
      }
      punc = punc.split("").reverse().join("");
      document
        .querySelector(".modal-body")
        .insertAdjacentHTML(
          "beforeend",
          `${punc2}<span class="span-for-sentence-in-modal" data-index="${count}">${s}</span>${punc}&nbsp;`
        );
      count++;
    });
    document.querySelector(".modal-body").onclick = this.#clickOnModalBody;
    document
      .querySelector(".btn-default")
      .addEventListener("click", (e) =>
        this.#handleClickOnSave(e, inputSentenceTestSplit, input)
      );
  }
  #clickOnModalBody(e) {
    if (
      e.target.classList.contains("span-for-sentence-in-modal") &&
      e.target.textContent.trim() !== ""
    ) {
      e.target.classList.toggle("highlight");
    }
  }

  #handleClickOnSave(e, inputSentenceTestSplit, input) {
    e.preventDefault();
    const arrayOfSpans = [];
    const allHighlightedSpans = document.querySelectorAll(".highlight");
    allHighlightedSpans.forEach(function (s) {
      if (s.dataset.index !== (null || undefined))
        arrayOfSpans.push(+s.dataset.index);
    });
    const typeOfChange = input
      .closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    const activeIndex = +input.closest(".row").dataset.index;
    const common = new CommonKTSP();
    const data = Object.fromEntries([
      ...new FormData(document.querySelector("form")),
    ]);
    data.answers = arrayOfSpans;
    common.sendForKeyTermsAndSpellings(
      data,
      typeOfChange,
      activeIndex,
      inputSentenceTestSplit
    );
  }
}

export default Adding;
