"use strict";

import { default as Common } from "./common.js";

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
        if (!this.randomTest) {
          throw new Error("Failed to load random test data.");
        }
        document.querySelector(".container").insertAdjacentHTML(
          "beforeend",
          `<div class="fixed">
             <div class="draggables"></div>
           </div>
           <div class="sentences"></div>`
        );
        this.#fixed = document.querySelector(".fixed .draggables");
        this.#sentencesContainer = document.querySelector(".sentences");
        this.#defaultDroppingSpanValue =
          "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        await this.#renderPage();
        this.#addDragAndDropHandlers();
        console.log(this.#answers);
        this.#check.addEventListener("click", this.#checkAnswers.bind(this));
      } catch (error) {
        console.error("Error initializing Displaying class:", error);
      }
    })();
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
      this.randomTest.answers.map(async (answer, i) => {
        if (typeof answer[0] === "number") {
          const sentence = this.randomTest.sentences[i].sentence.split(" ");
          for (let j = 0; j < sentence.length - 1; j += 2)
            sentence.splice(j + 1, 0, " ");
          const storedAnswer = [];
          let word = "";
          for (let j = 0; j < answer.length; j++) {
            word += sentence[answer[j]];
            if (answer[j] !== answer[j + 1] - 1) {
              storedAnswer.push(word);
              word = "";
            }
          }
          return { type: "text", content: storedAnswer };
        } else {
          const maskedParts = [];
          const imageUrl = this.randomTest.sentences[i].imageUrl;

          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
              answer.forEach((mask, index) => {
                const tempCanvas = document.createElement("canvas");
                const tempContext = tempCanvas.getContext("2d");

                tempCanvas.width = mask.width;
                tempCanvas.height = mask.height;

                tempContext.drawImage(
                  img,
                  mask.x,
                  mask.y,
                  mask.width,
                  mask.height,
                  0,
                  0,
                  mask.width,
                  mask.height
                );

                const dataURL = tempCanvas.toDataURL("image/png");
                if (!mask.id) {
                  mask.id = `mask${index + 1}`;
                }
                maskedParts.push({ id: mask.id, maskedImageURL: dataURL });
              });
              resolve({ type: "image", content: maskedParts });
            };

            img.onerror = () => {
              reject(new Error(`Failed to load image at ${imageUrl}`));
            };

            img.src = imageUrl;
          });
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
        const maskedPart = ans.content;
        html += `
            <span 
              class="word draggable" 
              draggable="true" 
              id="word-span-${i}" 
              data-id="${maskedPart.id}" 
              data-type="image">
              <img src="${maskedPart.maskedImageURL}" alt="Masked Part ${maskedPart.id}" class="img" />
            </span>
          `;
      } else if (ans.type === "text") {
        const text = ans.content;
        html += `
            <span 
              class="word draggable" 
              draggable="true" 
              id="word-span-${i}" 
              data-id="${i}"
              data-type="text">
              ${text}
            </span>
          `;
      } else {
        console.warn(`Unknown answer type at index ${i}:`, ans);
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
    // Have to refactor this code to include .forEach instead of for loop
    for (let i = 0; i < this.randomTest.sentences.length; i++) {
      const sentence = this.randomTest.sentences[i];
      const newSentence = sentence.sentence ? sentence.sentence.split(" ") : [];

      for (let j = 0; j < newSentence.length - 1; j += 2)
        newSentence.splice(j + 1, 0, " ");

      const answer = this.randomTest.answers[i][0];
      if (typeof answer === "number") {
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
          const naturalWidth = maskedImageData.naturalWidth;
          const naturalHeight = maskedImageData.naturalHeight;

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
            const renderedW = maskedImage.clientWidth;
            const renderedH = maskedImage.clientHeight;

            const scaleX = renderedW / naturalW;
            const scaleY = renderedH / naturalH;

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
        } catch (error) {
          this.#sentencesContainer.insertAdjacentHTML(
            "beforeend",

            `<div class="sentence mb-5" data-index="${i}">
              <br><img src="${imageUrl}" alt="Image ${
              i + 1
            }" class="masked-image" data-index="${i}"><br>
              ${sentence.sentence ? `${i + 1}: ${newSentence.join(" ")}` : ""}
            </div>`
          );
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
    console.log("Checking answers...");

    const indexOfActualSentence = [];
    const mistakenAnswers = [];
    let correctCount = 0;
    let totalCount = 0;

    this.#sentencesContainer
      .querySelectorAll(".sentence")
      .forEach((sentenceDiv, index) => {
        const sentenceIndex = sentenceDiv.getAttribute("data-index");
        const sentence = this.randomTest.sentences[sentenceIndex];
        const answers = this.randomTest.answers[sentenceIndex];

        if (!sentence.sentence && sentence.imageUrl) {
          const masks = answers;
          const arr = [];
          let temp = 0;
          masks.forEach((mask) => {
            const dropZone = sentenceDiv.querySelector(
              `.drop-zone[data-id="${mask.id}"]`
            );
            if (!dropZone) {
              console.warn(`Drop zone with data-id="${mask.id}" not found.`);
              return;
            }

            const draggable = dropZone.querySelector(".word.draggable");
            if (draggable) {
              let draggableId = draggable.getAttribute("data-id");
              if (draggableId === mask.id) {
                draggableId = draggableId.split("mask")[1] - 1;
                arr.push(answers[draggableId]);
                dropZone.style.border = "5px solid green";
                correctCount++;
                temp++;
              } else {
                draggableId = draggableId.split("mask")[1] - 1;
                arr.push(answers[draggableId]);
                dropZone.style.border = "5px solid red";
              }
              totalCount++;
            } else {
              totalCount++;
              arr.push("");
              dropZone.style.border = "5px solid red";
            }
          });
          if (masks.length !== temp) {
            indexOfActualSentence.push(sentenceIndex);
            mistakenAnswers.push(arr);
            sentenceDiv.insertAdjacentHTML(
              "beforeend",
              `<img src="${sentence.imageUrl}" />`
            );
          }
        } else {
          const droppingSpans = Array.from(
            sentenceDiv.querySelectorAll(".dropping-span")
          );
          const arr = [];
          let temp = 0;
          droppingSpans.forEach((el, i) => {
            const answer = this.#answers[totalCount].content;
            const item = el.querySelector(".word");
            if (item) {
              if (item.textContent.trim() === answer) {
                arr.push(answer);
                correctCount++;
                temp++;
              } else {
                console.log(item.textContent.trim());
                arr.push(answer);
              }
            } else {
              arr.push(answer);
            }
            totalCount++;
          });
          if (droppingSpans.length !== temp) {
            indexOfActualSentence.push(sentenceIndex);
            mistakenAnswers.push(arr);
            sentenceDiv.insertAdjacentHTML(
              "beforeend",
              `<div class="answer">${sentence.sentence}</div>`
            );
          }
        }
        console.log(correctCount);
      });

    console.log("Wrong Answers Array:", indexOfActualSentence, mistakenAnswers);

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
        const id = draggable.getAttribute("data-id");
        event.dataTransfer.setData("text/plain", id);
        event.dataTransfer.effectAllowed = "move";
        draggable.classList.add("dragging");
      } else {
        const id = draggable.getAttribute("data-id");
        event.dataTransfer.setData("text/plain", id);
        event.dataTransfer.setData("word", event.target.textContent);
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

          masks.forEach((mask, index) => {
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
