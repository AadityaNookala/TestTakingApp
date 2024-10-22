"use strict";

import { default as Common } from "./common.js";
import { imageUrlStartsWith } from "../../config.js";

class Displaying extends Common {
  #fixed;
  #answers = [];

  constructor() {
    super();
    (async () => {
      await this.getRandomTest();
      console.log(this.randomTest);
      document.querySelector(".container").insertAdjacentHTML(
        "beforeend",
        `<div class="fixed" draggable="true">

        </div>
        <div class="sentences" draggable="true">

        </div>
        `
      );
      this.#fixed = document.querySelector(".fixed");
      this.#renderPage();
    })();
  }

  #renderPage() {
    this.#renderDraggables();
    this.#renderQuestions();
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
          for (let i = 0; i < sentence.length - 1; i += 2)
            sentence.splice(i + 1, 0, " ");
          const storedAnswer = [];
          let word = "";
          for (let i = 0; i < answer.length; i++) {
            word += sentence[answer[i]];
            if (answer[i] !== answer[i + 1] - 1) {
              storedAnswer.push(word);
              word = "";
            }
          }
          return storedAnswer;
        } else {
          const maskedParts = [];
          const imageUrl = this.randomTest.sentences[i].imageUrl;

          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = function () {
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

                maskedParts.push(dataURL);
              });
              resolve(maskedParts);
            };

            img.onerror = function () {
              console.error(`Failed to load image at ${imageUrl}`);
              reject(new Error(`Failed to load image at ${imageUrl}`));
            };

            img.src = imageUrl;
          });
        }
      })
    );
  }

  #renderAnswers() {
    const fixedContainer = document.querySelector(".fixed");
    const randomAnswers = this.#randomizeArray(this.#answers);
    let html = "";
    randomAnswers.forEach((ans, i) => {
      if (!ans.startsWith(imageUrlStartsWith)) {
        html += `<span class="word" draggable="true" id="word-span-${i}">${ans}</span>`;
      } else {
        html += `<span class="word" draggable="true" id="word-span-${i}"><img src=${ans}></span>`;
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

  #renderQuestions() {
    let html = "";
    // <span class="dropping-span" id="dropping-span-${j}"><span class="word">${
    //   this.#defaultDroppingSpanValue
    // }</span></span>
    // <div class="sentence mb-5" data-index=${sentenceRandom[index][1]}>
    //   ${i + 1}: ${splitWordSentence.join(" ")}
    //   </div>
    this.randomTest.sentences.forEach((obj) => {
      if (obj.sentence) {
        const sentence = obj.sentence;
      }
    });
  }
}

export default Displaying;
