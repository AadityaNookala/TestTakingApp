import { default as CommonKTSP } from "../commonktsp.js";
import { baseUrl, uploadImage } from "../../../config.js";

class AddingSentence {
  constructor(input) {
    const inputSentenceTest = input.value.trim().split(" ");
    for (let i = 0; i < inputSentenceTest.length - 1; i += 2) {
      inputSentenceTest.splice(i + 1, 0, " ");
    }
    console.log(inputSentenceTest);
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML(
        "beforeend",
        `<input type="file" name="image" class="form-control modal-form-control" aria-label="file example" accept="image/*"><br>Sentence:`
      );
    let sentenceHtml = `<p>`;
    inputSentenceTest.forEach((el, i) => {
      sentenceHtml += `<span class="span-for-sentence-in-modal word" data-index="${i}">${
        el === " " ? "&nbsp;" : el
      }</span>`;
      // if (i < inputSentenceTest.length - 1) {
      //   sentenceHtml += `<span class="span-for-sentence-in-modal space" data-index="space-${i}">&nbsp;</span>`;
      // }
    });
    sentenceHtml += `</p>`;
    document
      .querySelector(".modal-body")
      .insertAdjacentHTML("beforeend", sentenceHtml);
    document.querySelector(".modal-body").onclick = this.#clickOnModalBody;
    this.#saveHandlerSentence(input, inputSentenceTest);
  }

  #clickOnModalBody(e) {
    console.log(e.target);
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

      const imageUrl = await uploadImage(baseUrl);
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
}

export default AddingSentence;
