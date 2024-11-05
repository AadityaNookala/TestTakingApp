"use strict";

import { default as Common } from "./common.js";
import displayingSentence from "../../helpers/displaying/keyterms/DisplayingSentence.js";
import displayingImage from "../../helpers/displaying/keyterms/DisplayingImage.js";

class Displaying extends Common {
  #fixed;
  #sentencesContainer;
  #answers = [];
  #defaultDroppingSpanValue;
  #check;

  constructor() {
    super();
    (async () => {
      try {
        await this.getRandomTest();
        this.#prepareDivs();

        // this.#defaultDroppingSpanValue =
        //   "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        await this.#renderPage();
        this.#addDragAndDropHandlers();
        this.#check.addEventListener("click", this.#checkAnswers.bind(this));
      } catch (error) {
        console.error("Error initializing Displaying class:", error);
      }
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
          return displayingSentence.createAnswers(
            this.randomTest,
            answer,
            i
          );
        } else {
          return displayingImage.createAnswers(
            this.randomTest,
            answer,
            i
          );
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
      const newSentence = sentence.sentence?.split(" ");
      if (typeof answer[0] === "number") {
        for (let j = 0; j < newSentence.length - 1; j += 2)
          newSentence.splice(j + 1, 0, " ");
        this.randomTest.answers[i].forEach((ans) => {
          newSentence[ans] = `<span class="dropping-span">
              <span class="word">${this.#defaultDroppingSpanValue}</span>
            </span>`;
        });

        for (let j = 0; j < newSentence.length - 1; j++) {
          if (newSentence[j] === newSentence[j + 1]) {
            newSentence.splice(j, 1);
            j = -1;
          }
        }

        for (let j = 0; j < newSentence.length; j++) {
          if (newSentence[j].startsWith("<span")) {
            newSentence[j] = `<span class="dropping-span" data-index="${j}">
                <span class="drop drop-zone" data-id=${j}></span>
              </span>`;
          }
        }

        this.#sentencesContainer.insertAdjacentHTML(
          "beforeend",

          `<div class="sentence mb-5" data-index="${i}">
            ${
              sentence.imageUrl
                ? `<br><img src="${sentence.imageUrl}" alt="Image ${
                    i + 1
                  }" class="masked-image" data-index="${i}"><br>`
                : ""
            }
            ${sentence.sentence ? `${i + 1}: ${newSentence.join(" ")}` : ""}
          </div>`
        );
      } else {
        const imageUrl = sentence.imageUrl;
        const masks = this.randomTest.answers[i];
        masks.forEach((mask, index) => {
          if (!mask.id) {
            mask.id = `mask${index + 1}`;
          }
        });

        try {
          const maskedImageData = await this.#maskImage(imageUrl, masks);
          const maskedImageURL = maskedImageData.maskedImageURL;

          this.#sentencesContainer.insertAdjacentHTML(
            "beforeend",

            `<div class="sentence mb-5" data-index="${i}">
              <div class="masked-image-container" style="position: relative; display: inline-block;">
                <img 
                  src="${maskedImageURL}" 
                  alt="Masked Image ${i + 1}" 
                  class="masked-image" 
                  data-index="${i}"
                  onload="this.dataset.naturalWidth = this.naturalWidth; this.dataset.naturalHeight = this.naturalHeight;"
                >
                ${masks
                  .map(
                    (mask) =>
                      `<div 
                        class="drop-zone" 
                        data-id="${mask.id}" 
                        style="
                          position: absolute;
                          left: 0%;
                          top: 0%;
                          width: 0%;
                          height: 0%;
                          box-sizing: border-box;
                          cursor: pointer;
                        ">
                      </div>`
                  )
                  .join("")}
              </div>
              ${sentence.sentence ? `${i + 1}: ${newSentence.join(" ")}` : ""}
            </div>`
          );

          const maskedImage = this.#sentencesContainer.querySelector(
            `.masked-image[data-index="${i}"]`
          );
          const dropZones = this.#sentencesContainer.querySelectorAll(
            `.drop-zone[data-id^="mask"]`
          );

          maskedImage.addEventListener("load", () => {
            const naturalW = maskedImage.naturalWidth;
            const naturalH = maskedImage.naturalHeight;

            dropZones.forEach((zone, idx) => {
              const mask = masks[idx];
              const xPercent = (mask.x / naturalW) * 100;
              const yPercent = (mask.y / naturalH) * 100;
              const widthPercent = (mask.width / naturalW) * 100;
              const heightPercent = (mask.height / naturalH) * 100;

              mask.xPercent = xPercent;
              mask.yPercent = yPercent;
              mask.widthPercent = widthPercent;
              mask.heightPercent = heightPercent;

              zone.style.left = `${mask.xPercent}%`;
              zone.style.top = `${mask.yPercent}%`;
              zone.style.width = `${mask.widthPercent}%`;
              zone.style.height = `${mask.heightPercent}%`;
            });
          });
        } catch (err) {
          console.error(err);
        }
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
          correctCount = count.correctCount;
          totalCount = count.totalCount;
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

    container.addEventListener("dragleave", (event) => {
      const dropZone =
        event.target.closest(".drop-zone") ||
        event.target.closest(".fixed .draggables");
      if (dropZone) {
        dropZone.classList.remove("over");
      }
    });

    container.addEventListener("drop", (event) => {
      event.preventDefault();
      const dropZone =
        event.target.closest(".drop-zone") ||
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

  #maskImage(imageUrl, masks) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          ctx.fillStyle = "#ffcb9a";

          masks.forEach((mask) => {
            ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
          });

          const maskedImageURL = canvas.toDataURL("image/png");

          resolve({
            maskedImageURL,
            naturalWidth: img.width,
            naturalHeight: img.height,
          });
        } catch (error) {
          reject(`Error while masking the image: ${error}`);
        }
      };

      img.onerror = () => {
        reject(
          "Failed to load the image. Please check the image URL and CORS settings."
        );
      };

      img.src = imageUrl;
    });
  }
}

export default Displaying;
