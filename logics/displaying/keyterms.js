"use strict";

import { default as Common } from "./common.js";
import displayingSentence from "../../helpers/displaying/keyterms/DisplayingSentence.js";
import displayingImage from "../../helpers/displaying/keyterms/DisplayingImage.js";

class Displaying extends Common {
  #fixed;
  #sentencesContainer;
  #answers = [];
  #check;

  constructor() {
    super();
    (async () => {
      await this.getRandomTest();
      this.#prepareDivs();
      await this.#renderPage();
      this.#addDragAndDropHandlers();
      this.#check.addEventListener("click", this.#checkAnswers.bind(this));
    })();
  }

  #prepareDivs() {
    document.querySelector(".container").insertAdjacentHTML(
      "beforeend",
      `<div class="fixed">
         <div class="draggables"></div>
       </div>
       <div class="sentences"></div>`
    );
    this.#fixed = document.querySelector(".fixed .draggables");
    this.#sentencesContainer = document.querySelector(".sentences");
  }

  async #renderPage() {
    this.#renderDraggables();
    await this.#renderQuestions();
  }

  async #renderDraggables() {
    await this.#createAnswers();
    this.#renderAnswers();
  }

  async #createAnswers() {
    this.#answers = await Promise.all(
      this.randomTest.answers.map((answer, i) => {
        if (typeof answer[0] === "number") {
          return displayingSentence.createAnswers(this.randomTest, answer, i);
        } else {
          return displayingImage.createAnswers(this.randomTest, answer, i);
        }
      })
    );

    this.#answers = this.#answers.flatMap((answer) =>
      answer.content.map((contentPiece) => {
        return { type: answer.type, content: contentPiece };
      })
    );
  }

  #renderAnswers() {
    const fixedContainer = document.querySelector(".fixed .draggables");
    const randomAnswers = this.#randomizeArray(this.#answers);
    let html = "";
    randomAnswers.forEach((ans, i) => {
      if (ans.type === "image") {
        html += displayingImage.renderAnswers(i, ans.content);
      } else {
        html += displayingSentence.renderAnswers(i, ans.content);
      }
    });

    fixedContainer.insertAdjacentHTML("afterbegin", html);
  }

  #randomizeArray(arr) {
    const newArray = arr.flat();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  async #renderQuestions() {
    for (let i = 0; i < this.randomTest.sentences.length; i++) {
      const answer = this.randomTest.answers[i];
      const sentence = this.randomTest.sentences[i];
      if (typeof answer[0] === "number") {
        this.#sentencesContainer.insertAdjacentHTML(
          "beforeend",
          displayingSentence.renderQuestions(
            this.randomTest.answers[i],
            sentence,
            i
          )
        );
      } else {
        const masks = this.randomTest.answers[i];
        this.#sentencesContainer.insertAdjacentHTML(
          "beforeend",
          await displayingImage.renderQuestions(i, sentence, masks)
        );

        displayingImage.activateDropZones(masks, i);
      }
    }

    document
      .querySelector(".sentences")
      .insertAdjacentHTML(
        "beforeend",
        `<button class="check">Check your answers!</button>`
      );
    this.#check = document.querySelector(".check");
    document.querySelector(".spinner-border").style.display = "none";
  }

  async #checkAnswers() {
    const indexOfActualSentence = [];
    const mistakenAnswers = [];
    let correctCount = 0;
    let totalCount = 0;

    this.#sentencesContainer
      .querySelectorAll(".sentence")
      .forEach((sentenceDiv) => {
        const sentenceIndex = sentenceDiv.getAttribute("data-index");
        const sentence = this.randomTest.sentences[sentenceIndex];
        const answers = this.randomTest.answers[sentenceIndex];
        let count;
        if (!sentence.sentence && sentence.imageUrl) {
          count = displayingImage.checkAnswers(
            sentence,
            answers,
            sentenceDiv,
            correctCount,
            totalCount,
            indexOfActualSentence,
            mistakenAnswers,
            sentenceIndex
          );
        } else {
          count = displayingSentence.checkAnswers(
            sentence,
            this.#answers,
            sentenceDiv,
            correctCount,
            totalCount,
            indexOfActualSentence,
            mistakenAnswers,
            sentenceIndex
          );
        }
        correctCount = count.correctCount;
        totalCount = count.totalCount;
      });

    const score = correctCount;
    const total = totalCount;
    this.#check.remove();
    document
      .querySelector(".sentences")
      .insertAdjacentHTML(
        "afterend",
        `<div class="score">Score:${score}/${total}</div>`
      );
    await this.sendAPIToScoresAndScheduler(
      mistakenAnswers,
      indexOfActualSentence,
      score,
      total
    );
  }

  #addDragAndDropHandlers() {
    const container = document.querySelector(".container");

    container.addEventListener("dragstart", (event) => {
      const draggable = event.target.closest(".word");
      if (!draggable) return;

      const type = draggable.getAttribute("data-type");
      if (type === "image") {
        displayingImage.addDragAndDropHandlers(event, draggable);
      } else {
        displayingSentence.addDragAndDropHandlers(event, draggable);
      }
    });

    container.addEventListener("dragend", (event) => {
      const draggable = event.target.closest(".word");
      if (draggable) {
        draggable.classList.remove("dragging");
      }
    });

    container.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    container.addEventListener("dragenter", (event) => {
      const dropZone =
        event.target.closest(".drop-zone") ||
        event.target.closest(".fixed .draggables");
      if (dropZone) {
        dropZone.classList.add("over");
      }
    });

    container.addEventListener("drop", (event) => {
      event.preventDefault();
      const dropZone =
        event.target.closest(".drop-zone") ||
        event.target.querySelector(".drop-zone") ||
        event.target.closest(".fixed .draggables");
      if (!dropZone) return;
      const draggedId = event.dataTransfer.getData("text/plain");
      const draggable = document.querySelector(`.word[data-id="${draggedId}"]`);
      if (!draggable) return;
      if (dropZone.classList.contains("drop-zone")) {
        this.#moveDraggableToDropZone(draggable, dropZone);
      } else if (dropZone.classList.contains("draggables")) {
        this.#moveDraggableToFixed(draggable);
      }

      dropZone.classList.remove("over");
    });
  }

  #moveDraggableToFixed(draggable) {
    if (!draggable) return;
    this.#fixed.appendChild(draggable);
  }

  #moveDraggableToDropZone(draggable, dropZone) {
    if (!draggable || !dropZone) return;

    const existingDraggable = dropZone.querySelector(".word");
    if (existingDraggable) {
      this.#moveDraggableToFixed(existingDraggable);
    }

    dropZone.appendChild(draggable);
  }
}

export default Displaying;
