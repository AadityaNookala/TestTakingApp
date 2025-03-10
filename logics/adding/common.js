import { arrOfPuncs, baseUrl } from "../../config.js";
import { sendAPI } from "../../helpers/helpers.js";
import { default as AddingSpellings } from "./spellings.js";
import { default as AddingSentenceCombining } from "./sentence-combining.js";
import { default as AddingKeyTerms } from "./keyterms.js";
import AddingChoiceForge from "./choice-forge.js";

class Common {
  #add;
  #form;
  #heading;
  #numberOfWords;
  #addingObject;
  #data;
  #dataType = new URLSearchParams(window.location.search).get("dataType");
  #dataEverything;
  #goTopBtn;
  constructor() {
    (async () => {
      this.#add = document.querySelector(".add");
      this.#form = document.querySelector("form");
      this.#heading = document.querySelector(".heading");
      this.#numberOfWords = 0;
      this.#dataEverything = (
        await sendAPI(
          "GET",
          `${baseUrl}/test/${this.#heading.textContent}/${new URLSearchParams(
            window.location.search
          ).get("testCategory")}`
        )
      ).data;
      this.#goTopBtn = document.querySelector(".go-to-top");

      this.#data = this.#dataEverything.test;
      if (this.#dataType === "spellings")
        this.#addingObject = new AddingSpellings();
      else if (this.#dataType === "sentence-combining")
        this.#addingObject = new AddingSentenceCombining();
      else if (this.#dataType === "key-terms") {
        this.#addingObject = new AddingKeyTerms();
      } else if (this.#dataType === "choice-forge") {
        this.#addingObject = new AddingChoiceForge();
      }
      await this.#showWords();
      if (this.#add) {
        this.#add.addEventListener("click", this.#addWord.bind(this));
      }
      document.addEventListener("click", this.#edit.bind(this));
      window.addEventListener("scroll", this.#scrollFunction.bind(this));
      this.#goTopBtn.addEventListener("click", this.#topFunction.bind(this));
    })();
  }

  #scrollFunction() {
    console.log(this.#goTopBtn);
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      this.#goTopBtn.style.display = "block";
    } else {
      this.#goTopBtn.style.display = "none";
    }
  }

  #topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  #showing() {
    this.#form.insertAdjacentHTML(
      "beforeend",
      ` <div class="row active-adding" data-index="${this.#numberOfWords++}">
        <div class="col-1">${this.#numberOfWords}
        </div>
        <div class="col-9 input-column">
        <textarea class="input-sentence" id="editing" type="text" name="sentences"></textarea>
        ${
          this.#dataType === "choice-forge"
            ? this.#addingObject.displayForm()
            : ""
        }
        </div>
        <div class="col-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
        </div>
        <button class="add-word" data-bs-toggle="modal" data-bs-target="#myModal" type="button" data-type-of-change="adding">Add</button>
      </div>`
    );
    document
      .querySelector(".add-choice")
      ?.addEventListener(
        "click",
        this.#addingObject.addChoice.bind(this.#addingObject)
      );
    document.querySelector(".input-sentence").focus();
  }

  async #showWords() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = (
      await sendAPI(
        "GET",
        `${baseUrl}/categories/clone/${urlParams.get("testCategory")}`
      )
    ).data.isClone;

    if (!category) {
      document
        .querySelector(".row")
        .insertAdjacentHTML("beforeend", `<div class="col-1">Edit</div>`);
    } else {
      document.querySelector(".add").remove();
    }

    const sentences = this.#data.sentences;

    for (let i = 0; i < sentences.length; i++) {
      let html = `<p class="sentence">`;
      const newSentence = sentences[i].sentence
        ? sentences[i].sentence
        : typeof sentences[i] === "string"
        ? sentences[i]
        : "";
      newSentence.split("\n").forEach((el, j) => {
        if (this.#dataType === "spellings" || this.#dataType === "key-terms") {
          const inputSentenceTest = el.trim().split(" ");
          if (this.#dataType === "key-terms") {
            for (let i = 0; i < inputSentenceTest.length - 1; i += 2) {
              inputSentenceTest.splice(i + 1, 0, " ");
            }
          }
          inputSentenceTest.forEach((word, k) => {
            let punc = "";
            let puncOfBeginning = "";
            const arr = word.split("");
            for (; arrOfPuncs.includes(arr[arr.length - 1]); ) {
              punc += arr.pop();
            }
            for (; arrOfPuncs.includes(arr[0]); ) {
              puncOfBeginning += arr.shift();
            }
            punc = punc.split("").reverse().join("");
            html += `${puncOfBeginning}<span class="${
              this.#data.answers[i].includes(k) ? "highlight" : ""
            }">${word
              .replace(punc, "")
              .replace(puncOfBeginning, "")}</span>${punc}${
              this.#dataType === "spellings" ? " " : ""
            }`;
          });
        } else html += el;
        if (newSentence.split("\n").length - 1 !== j) {
          html += "<br>";
        }
      });
      html += `</p>\n`;
      if (this.#dataType === "key-terms")
        html += await this.#addingObject.maskShowingImage(
          sentences[i],
          this.#data.answers[i]
        );
      if (this.#dataType === "choice-forge") {
        html += this.#addingObject.showImageAndChoices(
          this.#data.sentences[i],
          this.#data.answers[i]
        );
      }
      this.#form.insertAdjacentHTML(
        "beforeend",
        `<div class="row" data-index="${this.#numberOfWords++}">
          <div class="col-1">${i + 1}</div>
          <div class="col-9">
            ${html}
          </div>
          <div class="col-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
</div>
        </div>`
      );
    }

    document.querySelector(".spinner-border").style.display = "none";
    document.querySelector(".top-right-corner").innerHTML = `NoH: ${
      this.#dataEverything.count
    }`;
    if (this.#dataType === "choice-forge") {
      document.querySelector(".top-right-corner").remove();
    }
  }

  #addWord() {
    this.#showing();
    const addWord = document.querySelector(".add-word");
    const inputSentence = document.querySelector(".input-sentence");
    addWord.addEventListener("click", () =>
      this.#addingObject.showingModal(inputSentence)
    );
  }

  #edit(e) {
    const edit = e.target.closest(".w-6");
    if (!edit) return;
    const row = edit.closest(".row");
    row.classList.add("active-adding");
    const sentenceRow = row.querySelector(".col-9");
    const textCont = sentenceRow.querySelector(".sentence").textContent.trim();
    let html = ``;
    textCont.split("\n").forEach((el, i) => {
      html += el;
      if (textCont.split("\n").length - 1 !== i) {
        html += "\n";
      }
    });
    sentenceRow.innerHTML = `<textarea class="input-sentence" id="editing" type="text" name="sentences"></textarea>`;
    const input = sentenceRow.querySelector(".input-sentence");
    input.value = html;
    input.focus();
    row.insertAdjacentHTML(
      "beforeend",
      `<button class="edit-word" data-bs-toggle="modal" data-bs-target="#myModal" type="button" data-type-of-change="editing">Edit</button>`
    );
    let sentence;
    if (this.#data.sentences[row.dataset.index].sentence) {
      sentence = this.#data.sentences[row.dataset.index].sentence;
    } else if (this.#data.sentences[row.dataset.index].imageUrl) {
      sentence = null;
    } else {
      sentence = this.#data.sentences[row.dataset.index];
    }
    document
      .querySelector(".edit-word")
      .addEventListener("click", () =>
        this.#addingObject.showingModal(
          input,
          sentence,
          this.#data.answers[row.dataset.index]
        )
      );
  }
}

export default Common;
