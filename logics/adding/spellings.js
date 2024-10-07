"use strict";

import { arrOfPuncs } from "../../config.js";
import { default as CommonKTSP } from "./commonktsp.js";

class Adding {
  showingModal() {
    const clickOnModalBody = function (e) {
      if (
        e.target.classList.contains("span-for-sentence-in-modal") &&
        e.target.textContent.trim() !== ""
      ) {
        e.target.classList.toggle("highlight");
      }
    };
    const arrayOfSpans = [];
    document.querySelector(".modal-body").textContent = "";
    const inputSentenceTest = this.value;
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
    const typeOfChange = this.closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    const activeIndex = +this.closest(".row").dataset.index;
    document.querySelector(".modal-body").onclick = clickOnModalBody;
    document
      .querySelector(".btn-default")
      .addEventListener("click", async function () {
        const allHighlightedSpans = document.querySelectorAll(".highlight");
        allHighlightedSpans.forEach(function (s, i) {
          arrayOfSpans.push(+s.dataset.index);
        });
        document.querySelector("form").requestSubmit();
      });
    document
      .querySelector("form")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const common = new CommonKTSP();
        common.sendForKeyTermsAndSpellings(
          arrayOfSpans,
          typeOfChange,
          activeIndex
        );
      });
  }
}

export default Adding;
