"use strict";

import { default as CommonKTSP } from "../adding/commonktsp.js";
import { baseUrl } from "../../config.js";

class Adding {
  showingModal(input) {
    document.querySelector(".modal-body").textContent = "";
    const inputSentenceTest = input.value.trim().split(" ");
    for (let i = 0; i < inputSentenceTest.length - 1; i += 2) {
      inputSentenceTest.splice(i + 1, 0, " ");
    }
    console.log(inputSentenceTest);
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML(
        "beforeend",
        `<input type="file" name="image" class="form-control modal-form-control" aria-label="file example" accept="image/*"><br>Sentence: `
      );
    inputSentenceTest.forEach((el, i) => {
      document
        .querySelector(".modal-body")
        .insertAdjacentHTML(
          "beforeend",
          `<span class="span-for-sentence-in-modal" data-index="${i}">${el}</span>`
        );
    });
    this.#saveHandler(input, inputSentenceTest);
  }

  #clickOnModalBody(e) {
    if (e.target.classList.contains("span-for-sentence-in-modal")) {
      e.target.classList.toggle("highlight");
    }
  }

  #saveHandler(input, inputSentenceTest) {
    const typeOfChange = input
      .closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    const activeIndex = +input.closest(".row").dataset.index;
    document.querySelector(".modal-body").onclick = this.#clickOnModalBody;
    document.querySelector(".btn-default").onclick = async () => {
      const arrOfIndexes = [];

      document.querySelectorAll(".highlight").forEach((el) => {
        arrOfIndexes.push(+el.dataset.index);
      });

      const imageUrl = await this.#uploadImage();
      const data = Object.fromEntries([
        ...new FormData(document.querySelector("form")),
      ]);
      data.answers = arrOfIndexes;

      data.sentences = { sentence: data.sentences };
      if (imageUrl) data.sentences.imageUrl = imageUrl;

      console.log(data);

      const common = new CommonKTSP();
      await common.sendForKeyTermsAndSpellings(
        data,
        typeOfChange,
        activeIndex,
        inputSentenceTest
      );
    };
  }

  async #uploadImage() {
    const fileInput = document.querySelector(".modal-form-control");
    const file = fileInput.files[0];
    console.log(file);
    if (!file) return null;
    const attachedImageId = crypto.randomUUID();
    const response = await fetch(
      `${baseUrl}/get-signed-url?fileName=${file.name}-${attachedImageId}`
    );
    const uploadUrl = (await response.json()).url;
    console.log(uploadUrl);

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: file,
    });

    return `https://storage.googleapis.com/test-taking-bucket/${file.name}-${attachedImageId}`;
  }
}

export default Adding;
