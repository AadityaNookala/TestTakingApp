import { baseUrl } from "../../config.js";
import { sendAPI } from "../../helpers/helpers.js";
import { default as AddingSpellings } from "./spellings.js";
import { default as AddingSentenceCombining } from "./sentence-combining.js";
import { default as AddingKeyTerms } from "./keyterms.js";

class Common {
  #add;
  #form;
  #heading;
  #numberOfWords;
  #addingObject;
  #data;
  #dataType = new URLSearchParams(window.location.search).get("dataType");
  #dataEverything;

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
      this.#data = this.#dataEverything.test;
      if (this.#dataType === "spellings")
        this.#addingObject = new AddingSpellings();
      else if (this.#dataType === "sentence-combining")
        this.#addingObject = new AddingSentenceCombining();
      else if (this.#dataType === "key-terms") {
        this.#addingObject = new AddingKeyTerms();
      }
      await this.#showWords();
      if (this.#add) {
        this.#add.addEventListener("click", this.#addWord.bind(this));
      }
      document.addEventListener("click", this.#edit.bind(this));
    })();
  }

  #showing() {
    this.#form.insertAdjacentHTML(
      "beforeend",
      ` <div class="row active-adding" data-index="${this.#numberOfWords++}">
        <div class="col-1">${this.#numberOfWords}
        </div>
        <div class="col-9">
        <textarea class="input-sentence" id="editing" type="text" name="sentences"></textarea>
        </div>
        <div class="col-1">
        <!-- SVG Icon Removed for Brevity -->
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
      document
        .querySelector(".row")
        .insertAdjacentHTML("beforeend", `<div class="col-1">Edit</div>`);
    } else {
      document.querySelector(".add").remove();
    }

    const sentences = this.#data.sentences;

    for (let i = 0; i < sentences.length; i++) {
      let html = `<p class="sentence">`;
      const newSentence = sentences[i].sentence || "";

      newSentence.split("\n").forEach((el) => {
        html += `<span>${el}</span><br>`;
      });
      html += `</p>\n`;

      if (sentences[i].imageUrl && !sentences[i].sentence) {
        const maskedAreas = this.#data.answers[i] || [];
        const img = new Image();
        img.src = sentences[i].imageUrl;

        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        const canvasId = `mask-${Math.random().toString(36).substring(2, 9)}`;

        html += `
          <div class="image-container" >
            <img class="image" src="${sentences[i].imageUrl}" alt="Masked Image" style="display: block; width: 100%; height: auto;" />
            <canvas id="${canvasId}" width="${imageWidth}" height="${imageHeight}" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
          </div>
        `;

        setTimeout(() => {
          const canvas = document.getElementById(canvasId);
          if (canvas.getContext) {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(128, 128, 128, 0.5)";

            maskedAreas.forEach((area) => {
              ctx.fillRect(area.x, area.y, area.width, area.height);
            });
          } else {
            console.error("Canvas not supported in this browser.");
          }
        }, 0);
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
