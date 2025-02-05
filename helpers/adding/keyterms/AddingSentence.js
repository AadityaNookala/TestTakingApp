import { default as CommonKTSP } from "../../../logics/adding/commonktsp.js";
import { baseUrl, arrOfPuncs } from "../../../config.js";
import { uploadImage } from "../../../helpers/helpers.js";

class AddingSentence {
  constructor(input, sentence, answers) {
    const inputSentenceTest = input.value.trim().split(" ");
    for (let i = 0; i < inputSentenceTest.length - 1; i += 2) {
      inputSentenceTest.splice(i + 1, 0, " ");
    }
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML(
        "beforeend",
        `<input type="file" name="image" class="form-control modal-form-control" aria-label="file example" accept="image/*"><br>Sentence:`
      );
    let sentenceHtml = `<p>`;
    let count = 0;
    inputSentenceTest.forEach(function (s, i) {
      const bool = arrOfPuncs.some((punc) => s.includes(punc));
      let punc = "";
      let punc2 = "";
      if (bool && s !== " ") {
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
      sentenceHtml += `${punc2}<span class="span-for-sentence-in-modal ${
        sentence === input.value &&
        typeof answers[0] === "number" &&
        answers.includes(i)
          ? "highlight"
          : ""
      }" data-index="${count}">${s === " " ? "&nbsp" : s}</span>${punc}`;
      count++;
    });
    sentenceHtml += `</p>`;
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML("beforeend", sentenceHtml);
    document.querySelector(".modal-body").onclick = this.#clickOnModalBody;
    this.#saveHandlerSentence(input, inputSentenceTest);
  }

  #clickOnModalBody(e) {
    if (e.target.classList.contains("span-for-sentence-in-modal")) {
      e.target.classList.toggle("highlight");
    }
  }

  #saveHandlerSentence(input, inputSentenceTest) {
    const typeOfChange = input
      .closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    const activeIndex = +input.closest(".row").dataset.index;
    document.querySelector(".btn-default").onclick = async () => {
      const arrOfIndexes = [];

      document.querySelectorAll(".highlight").forEach((el) => {
        if (el.dataset.index !== (null || undefined))
          arrOfIndexes.push(+el.dataset.index);
      });

      const { imageUrl } = (await uploadImage(baseUrl))[0];
      const data = Object.fromEntries([
        ...new FormData(document.querySelector("form")),
      ]);
      data.answers = arrOfIndexes;

      data.sentences = { sentence: data.sentences };
      if (imageUrl) data.sentences.imageUrl = imageUrl;

      const common = new CommonKTSP();
      await common.sendForKeyTermsAndSpellings(
        data,
        typeOfChange,
        activeIndex,
        inputSentenceTest
      );
    };
  }
}

export default AddingSentence;
