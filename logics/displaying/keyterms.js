"use strict";

import { default as Common } from "./common.js";

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

  #renderDraggables() {
    this.#answers = this.randomTest.answers.map((answer, i) => {
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

            maskedParts.push({ index, dataURL });
          });
          console.log(maskedParts);
        };
        img.src = imageUrl;
      }
    });
  }

  #renderQuestions() {}
}

export default Displaying;
