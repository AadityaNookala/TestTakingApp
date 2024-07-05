import { baseUrl, sendAPI, arrOfPuncs } from "../../config.js";
import { default as Common } from "./common.js";
class Displaying extends Common {
  #fixed;
  #modal;
  #overlay;
  #defaultDroppingSpanValue;
  #words;
  #idOfSentence;
  #allMeanings;
  #check;
  #url;
  #sentences;

  constructor() {
    (async () => {
      super();
      await this.getRandomTest();
      document.querySelector(".container").insertAdjacentHTML(
        "beforeend",
        `<div class="fixed" draggable="true">

    </div>
    <div class="sentences" draggable="true">

    </div>`
      );
      this.#url = new URLSearchParams(window.location.search);
      this.#sentences = document.querySelector(".sentences");
      this.#fixed = document.querySelector(".fixed");
      this.#modal = document.querySelector(".my-modal");
      this.#overlay = document.querySelector(".overlay");
      this.#defaultDroppingSpanValue =
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      this.#words = [];
      this.#allMeanings = {};

      this.#renderSentences();
      this.#check.addEventListener("click", this.#checkAnswers.bind(this));
      this.#fixed.addEventListener("click", this.#getMeaning.bind(this));
      this.#fixed.addEventListener(
        "dragstart",
        this.#fixedDragstart.bind(this)
      );
      this.#sentences.addEventListener(
        "dragstart",
        this.#sentencesDragstart.bind(this)
      );
      this.#sentences.addEventListener(
        "dragover",
        this.#sentencesDragover.bind(this)
      );
      this.#fixed.addEventListener("dragover", this.#fixedDragover.bind(this));
      this.#sentences.addEventListener("drop", this.#sentencesDrop.bind(this));
      this.#fixed.addEventListener("drop", this.#fixedDrop.bind(this));
    })();
  }
  #renderSentences() {
    let sentenceRandom = this.randomTest.sentences.map((sentence, i) => [
      sentence,
      i,
    ]);
    let indexRandom = this.randomTest.answers.slice();
    const lengthSentenceRandom = sentenceRandom.length;
    this.randomTest.sentences.forEach((_, i) => {
      const splitWordSentence = this.randomTest.sentences[i].split(" ");
      let wordSentence = [];
      this.randomTest.answers[i].forEach((element) => {
        let some = splitWordSentence[element].trim();
        const bool = arrOfPuncs.some((punc) => some.includes(punc));
        if (bool) {
          const arr = some.split("");
          for (; arrOfPuncs.includes(arr[arr.length - 1]); ) arr.pop();
          for (; arrOfPuncs.includes(arr[0]); ) arr.shift();
          some = arr.join("");
        }
        wordSentence.push(some);
      });
      this.#words.push(wordSentence);
    });

    const wordsFlatted = this.#words.slice().flat();
    const lengthWord = wordsFlatted.length;
    let html = ``;
    for (let i = 0; i < lengthWord; i++) {
      const index = Math.trunc(Math.random() * wordsFlatted.length);
      html += `<span class="word" draggable="true" id="word-span-${i}">${wordsFlatted[index]}</span>`;
      if (i % 2 !== 0) {
        this.#fixed.insertAdjacentHTML(
          "beforeend",
          `<div class="row">${html}</div>`
        );
        html = ``;
      }
      if (i === lengthWord - 1 && i % 2 === 0) {
        this.#fixed.insertAdjacentHTML(
          "beforeend",
          `<div class="row">${html}</div>`
        );
        html = ``;
      }

      wordsFlatted.splice(index, 1);
    }
    const actualAnswers = [];
    let j = 0;
    sentenceRandom = this.randomTest.sentences.map((sentence, i) => [
      sentence,
      i,
    ]);
    indexRandom = this.randomTest.answers.slice();
    for (let i = 0; i < lengthSentenceRandom; i++) {
      const index = Math.trunc(Math.random() * sentenceRandom.length);
      let wordSentence = ``;
      const splitWordSentence = sentenceRandom[index][0].split(" ");
      const array = [];
      indexRandom[index].forEach((element, indexing) => {
        wordSentence = ` ${splitWordSentence[element]}`;
        const bool = arrOfPuncs.some((punc) => wordSentence.includes(punc));
        let punc = "";
        let punc2 = "";
        if (bool) {
          const arr = wordSentence.split("");
          for (; arrOfPuncs.includes(arr[arr.length - 1]); ) punc += arr.pop();
          arr.shift();
          for (; arrOfPuncs.includes(arr[0]); ) punc2 += arr.shift();
          wordSentence = arr.join("");
        }
        punc = punc.split("").reverse().join("");

        array.push(splitWordSentence.join(" ").trim());
        splitWordSentence[element] =
          punc2 +
          `<span class="dropping-span" id="dropping-span-${j}"><span class="word">${
            this.#defaultDroppingSpanValue
          }</span></span>` +
          punc;
        j++;
        if (indexing === indexRandom[index].length - 1) {
          this.#sentences.insertAdjacentHTML(
            "beforeend",
            `<div class="sentence mb-5" data-index=${sentenceRandom[index][1]}>
      ${i + 1}: ${splitWordSentence.join(" ")}
      </div>`
          );
        }
      });
      actualAnswers.push(array[0]);

      sentenceRandom.splice(index, 1);
      indexRandom.splice(index, 1);
    }
    sentenceRandom = this.randomTest.sentences.slice();

    this.#sentences.insertAdjacentHTML(
      "beforeend",
      `<button class="check">Check your answers!</button>`
    );
    this.#check = document.querySelector(".check");
    document.querySelector(".spinner-border").style.display = "none";
  }
  async #checkAnswers() {
    const droppingSpans = Array.from(document.querySelectorAll(".sentence"))
      .map((el) => [el, +el.dataset.index])
      .sort((a, b) => a[1] - b[1])
      .map((el) => Array.from(el[0].querySelectorAll(".dropping-span")));
    let score = 0;
    let noOfWords = 0;
    const enteredAnswers = [];
    const indexOfMistake = [];
    droppingSpans.forEach((el, i) => {
      el.forEach((droppingSpanWord, j) => {
        noOfWords++;
        if (droppingSpanWord.querySelector(".word")) {
          if (
            droppingSpanWord.querySelector(".word").textContent.trim() ===
            this.#words[i][j]
          ) {
            score++;
          } else {
            if (
              !droppingSpanWord.closest(".sentence").querySelector(".answer")
            ) {
              droppingSpanWord
                .closest(".sentence")
                .insertAdjacentHTML(
                  "beforeend",
                  `<div class="answer">${
                    this.randomTest.sentences[
                      droppingSpanWord.closest(".sentence").dataset.index
                    ]
                  }</div>`
                );
              indexOfMistake.push(
                droppingSpanWord.closest(".sentence").dataset.index
              );
              const arr = el.map((element) =>
                element.querySelector(".word").textContent.trim()
              );
              enteredAnswers.push(arr);
            }
          }
        } else {
          if (!droppingSpanWord.closest(".sentence").querySelector(".answer")) {
            droppingSpanWord
              .closest(".sentence")
              .insertAdjacentHTML(
                "beforeend",
                `<div class="answer">${
                  randomTest.sentences[
                    droppingSpanWord.closest(".sentence").dataset.index
                  ]
                }</div>`
              );
            indexOfMistake.push(
              droppingSpanWord.closest(".sentence").dataset.index
            );
          }
        }
      });
    });
    this.#sentences.insertAdjacentHTML(
      "beforeend",
      `<div class="score">Score: ${score}/${noOfWords}</div>`
    );
    await this.sendAPIToScoresAndScheduler(
      enteredAnswers,
      indexOfMistake,
      score,
      noOfWords
    );
    this.#check.remove();
  }
  async #getMeaning(e) {
    this.#modal = document.querySelector(".my-modal");
    this.#overlay = document.querySelector(".overlay");

    const word = e.target.closest(".word");
    if (!word) return;
    const meanings = (
      await sendAPI(
        "GET",
        `${baseUrl}/categories/${this.#url.get("testCategory")}`
      )
    ).data.meanings;

    if (meanings) return;

    const actualWord = word.textContent.trim();
    this.#modal.innerHTML = `
        <button class="btn--close-modal">×</button>
        <h2 class="modal__header"></h2>
        <div class="modal__form"></div>
        <div class="meaning mt-5">
        </div>
      <div class="spinner"><div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
      </div></div>`;
    const closeModalButton = document.querySelector(".btn--close-modal");

    document.querySelector(".modal__header").innerHTML = actualWord;
    this.#modal.classList.remove("hidden");
    this.#overlay.classList.remove("hidden");
    if (this.#allMeanings[actualWord]) {
      document.querySelector(".modal__form").innerHTML =
        this.#allMeanings[actualWord];
    } else {
      const meaning = (
        await sendAPI(
          "GET",
          `${baseUrl}/word-meaning/${word.textContent.trim()}`
        )
      ).data;

      let html = "";
      meaning.forEach((el, i) => {
        let synonyms = ``;
        let sentences = "";
        el.synonyms.forEach((synonym, i) => {
          synonyms += `${synonym}`;
          if (i !== el.synonyms.length - 1) {
            synonyms += ", ";
          }
        });
        el.sentences.forEach((sentence) => {
          sentences += `
            <li>
              ${sentence}
            </li>`;
        });
        html += `
          <div class="meaning mt-5">
            <span>${i + 1}.</span>
            <span>(${el.partOfSpeech})</span>
            <span class="definition">
              ${el.definition}
            </span>
            <ul class="meaning-sentences">
              ${sentences}
            </ul>
            Synonyms:
            <span class="synonyms">
              ${synonyms}
            </span>
          </div>
          `;
      });

      document.querySelector(".modal__form").innerHTML = html;
      this.#allMeanings[actualWord] = html;
    }
    this.#modal.querySelector(".spinner-border").classList.add("hidden");
    closeModalButton.addEventListener("click", this.#closeModal);

    this.#overlay.addEventListener("click", this.#closeModal);
  }
  #closeModal() {
    this.#modal = document.querySelector(".my-modal");
    this.#overlay = document.querySelector(".overlay");
    this.#overlay.classList.add("hidden");
    this.#modal.classList.add("hidden");
  }

  #fixedDragstart(e) {
    if (e.target.classList.contains("fixed")) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("word", e.target.textContent);
    e.dataTransfer.setData("id", e.target.id);
    e.dataTransfer.setData("current", e.currentTarget.className);
  }

  #sentencesDragstart(e) {
    if (e.target.classList.contains("sentences")) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("word", e.target.textContent);
    e.dataTransfer.setData(
      "originalWord",
      e.target.closest(".dropping-span").id
    );
  }

  #sentencesDragover(e) {
    if (!e.target.closest(".dropping-span")) return;
    e.preventDefault();
  }

  #fixedDragover(e) {
    e.preventDefault();
  }

  #sentencesDrop(e) {
    e.preventDefault();
    const dragged = e.dataTransfer.getData("word");
    const testCont = e.target.closest(".dropping-span").textContent;
    if (dragged === e.target.textContent) return;
    e.target.innerHTML = "";
    e.target.insertAdjacentHTML(
      "beforeend",
      `<span class="word" draggable="true">${dragged}</span>`
    );
    const id = e.dataTransfer.getData("id");
    if (id) {
      this.#idOfSentence = id;
      document.querySelector(`#${id}`).remove();
    }
    if (!e.dataTransfer.getData("originalWord")) return;
    const originalWord = document.querySelector(
      `#${e.dataTransfer.getData("originalWord")}`
    );
    originalWord.textContent = testCont;
    originalWord.setAttribute("draggable", true);
  }

  #fixedDrop(e) {
    e.preventDefault();
    const dragged = e.dataTransfer.getData("word");
    if (e.currentTarget.className === e.dataTransfer.getData("current")) return;
    e.target.insertAdjacentHTML(
      "beforeend",
      `<span class="word" draggable="true" id="${
        this.#idOfSentence
      }">${dragged}</span>`
    );
    if (!e.dataTransfer.getData("originalWord")) return;
    document.querySelector(
      `#${e.dataTransfer.getData("originalWord")}`
    ).innerHTML = `<span class="span">${this.#defaultDroppingSpanValue}</span>`;
  }
}

export default Displaying;
