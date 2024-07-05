"use strict";

import { baseUrl, sendAPI } from "../../config.js";
import { default as AddingSpellings } from "../../logics/adding/spellings.js";
import { default as AddingSentenceCombining } from "../../logics/adding/sentence-combining.js";

class App {
  #add;
  #form;
  #heading;
  #numberOfWords;
  #addingObject;
  #data;
  constructor() {
    (async () => {
      this.#add = document.querySelector(".add");
      this.#form = document.querySelector("form");
      this.#heading = document.querySelector(".heading");
      this.#numberOfWords = 0;
      this.#getUrlParams();
      this.#data = (
        await sendAPI("GET", `${baseUrl}/test/${this.#heading.textContent}`)
      ).data.test;
      await this.#showWords();

      if (this.#add) {
        this.#add.addEventListener("click", this.#addWord.bind(this));
      }
      document.addEventListener("click", this.#edit.bind(this));
    })();
  }
  #getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.#heading.textContent = decodeURIComponent(urlParams.get("testName"));
    const dataType = urlParams.get("dataType");
    if (dataType === "spellings") this.#addingObject = new AddingSpellings();
    else if (dataType === "sentence-combining")
      this.#addingObject = new AddingSentenceCombining();
  }
  #showing() {
    this.#form.insertAdjacentHTML(
      "beforeend",
      ` <div class="row active-adding" data-index="${this.#numberOfWords++}">
    <div class="col-1">${this.#numberOfWords}
    </div>
    <div class="col-7">
    <textarea class="input-sentence" id="editing" type="text" name="sentences"></textarea>
    </div>
    <div class="col-1">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
              class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
              </path>
            </svg>
    </div>
    <button class="add-word" data-bs-toggle="modal" data-bs-target="#myModal" type="button" data-type-of-change="adding">Add</button>
    </div>`
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
      document.querySelector(".row").insertAdjacentHTML(
        "beforeend",
        `<div class="col-1">
      Edit
    </div>`
      );
    } else {
      document.querySelector(".add").remove();
    }
    const sentences = this.#data.sentences;
    sentences.forEach((_, i) => {
      let html = ``;
      sentences[i].split("\n").forEach((el, j) => {
        html += el;
        if (sentences[i].split("\n").length - 1 !== j) {
          html += "<br>";
        }
      });
      this.#form.insertAdjacentHTML(
        "beforeend",
        `<div class="row" data-index="${this.#numberOfWords++}">
      <div class="col-1">${i + 1}</div>
      <div class="col-7">
      ${html}
      </div>
      ${
        category
          ? ""
          : `<div class="col-1">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
                </path>
              </svg>
      </div>`
      }
      </div>`
      );
    });
    document.querySelector(".spinner-border").style.display = "none";
  }

  #addWord() {
    this.#showing();
    const addWord = document.querySelector(".add-word");
    const inputSentence = document.querySelector(".input-sentence");
    addWord.addEventListener(
      "click",
      this.#addingObject.showingModal.bind(inputSentence)
    );
  }
  #edit(e) {
    const edit = e.target.closest(".w-6");
    if (!edit) return;
    const row = edit.closest(".row");
    row.classList.add("active-adding");
    const sentenceRow = row.querySelector(".col-7");
    const textCont =
      this.#data.sentences[row.querySelector(".col-1").textContent - 1];
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
    document
      .querySelector(".edit-word")
      .addEventListener("click", this.#addingObject.showingModal.bind(input));
  }
}

new App();
