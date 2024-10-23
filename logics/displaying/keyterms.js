"use strict";

import { default as Common } from "./common.js";
import { imageUrlStartsWith } from "../../config.js";

class Displaying extends Common {
  #fixed;
  #answers = [];
  #defaultDroppingSpanValue;
  #check;
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
      this.#defaultDroppingSpanValue =
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      this.#renderPage();
    })();
  }

  async #renderPage() {
    await this.#renderDraggables();
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
    const randomAnswers = this.#randomizeArray(this.#answers);
    let html = "";
    randomAnswers.forEach((ans, i) => {
      if (!ans.startsWith(imageUrlStartsWith)) {
        html += `<span class="word" draggable="true" id="word-span-${i}">${ans}</span>`;
      } else {
        html += `<span class="word" draggable="true" id="word-span-${i}"><img src=${ans}></span>`;
      }
    });
    this.#fixed.insertAdjacentHTML("afterbegin", html);
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
    this.randomTest.sentences.forEach((sentence, i) => {
      const newSentence = sentence.sentence ? sentence.sentence.split(" ") : "";
      for (let i = 0; i < newSentence.length - 1; i += 2)
        newSentence.splice(i + 1, 0, " ");
      console.log(this.randomTest.answers[i]);
      this.randomTest.answers[i].forEach((answer, j) => {
        if (typeof answer === "number") {
          if (j === 0) {
            newSentence[
              answer
            ] = `<span class="dropping-span" id="dropping-span-${j}"><span class="word">${
              this.#defaultDroppingSpanValue
            }</span></span>`;
          } else {
          }
        } else {
        }
      });
      console.log(newSentence);
      document.querySelector(".sentences").insertAdjacentHTML(
        "beforeend",
        `<div class="sentence mb-5" data-index=${i}>
        ${sentence.imageUrl ? `<br><img src="${sentence.imageUrl}"><br>` : ""}
        ${sentence.sentence ? `${i + 1}: ${newSentence.join(" ")}` : ""}
        </div>`
      );
    });
    document
      .querySelector(".sentences")
      .insertAdjacentHTML(
        "beforeend",
        `<button class="check">Check your answers!</button>`
      );
    this.#check = document.querySelector(".check");
    document.querySelector(".spinner-border").style.display = "none";
  }
}

export default Displaying;
