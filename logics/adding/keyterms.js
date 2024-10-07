"use strict";

import { default as CommonKTSP } from "../adding/commonktsp.js";
import { baseUrl } from "../../config.js";

class Adding {
  showingModal() {
    const clickOnModalBody = function (e) {
      if (e.target.classList.contains("span-for-sentence-in-modal")) {
        e.target.classList.toggle("highlight");
      }
    };
    document.querySelector(".modal-body").textContent = "";
    const inputSentenceTest = this.value.trim().split("");
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML(
        "beforeend",
        `<input type="file" class="form-control modal-form-control" aria-label="file example" accept="image/*"><br>Sentence: `
      );
    inputSentenceTest.forEach((el, i) => {
      document
        .querySelector(".modal-body")
        .insertAdjacentHTML(
          "beforeend",
          `<span class="span-for-sentence-in-modal" data-index="${i}">${el}</span>`
        );
    });
    const typeOfChange = this.closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    const activeIndex = +this.closest(".row").dataset.index;
    document.querySelector(".modal-body").onclick = clickOnModalBody;
    document.querySelector(".btn-default").onclick = async function () {
      const arrOfIndexes = [];
      document.querySelectorAll(".highlight").forEach((el) => {
        arrOfIndexes.push(+el.dataset.index);
      });
      // const common = new CommonKTSP();
      // common.sendForKeyTermsAndSpellings(
      //   arrOfIndexes,
      //   typeOfChange,
      //   activeIndex
      // );
      const formData = new FormData();
      const fileInput = document.querySelector(".modal-form-control");
      const file = fileInput.files[0];
      formData.append(
        "questionImage",
        file,
        `section1-questionImage-${crypto.randomUUID()}.png`
      );
      await fetch(`${baseUrl}/key-terms/upload-image`, {
        method: "POST",
        body: formData,
      });
    };
  }
}

export default Adding;
