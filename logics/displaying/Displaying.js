import { default as Common } from "./common.js";

export class Displaying extends Common {
  #check;
  #sentences;
  constructor() {
    (async () => {
      super();
      await this.getRandomTest();
      document.querySelector(".container").insertAdjacentHTML(
        "beforeend",
        `
    <div class="sentences" draggable="true">
        
    </div>`
      );
      this.#sentences = document.querySelector(".sentences");
      this.#renderSentences();
      this.#check.addEventListener("click", this.#checkAnswers.bind(this));
    })();
  }
  #renderSentences() {
    let currentIndex = this.randomTest.sentences.length;
    const sentences = [];
    const sliceSentences = this.randomTest.sentences.slice();
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      sentences.push(sliceSentences[randomIndex]);
      sliceSentences.splice(randomIndex, 1);
    }
    sentences.forEach((element) => {
      this.#sentences.insertAdjacentHTML(
        "beforeend",
        `<div class="sentence-div"><p class="sentence">${element
          .split("\n")
          .map((el) => `${el}<br>`)
          .join(
            ""
          )}</p>&nbsp; &nbsp;<textarea class="sentences-input"></textarea><br></div>`
      );
    });
    this.#sentences.insertAdjacentHTML(
      "beforeend",
      `<button class="check">Check your answers!</button>`
    );
    this.#check = document.querySelector(".check");
    document.querySelector(".spinner-border").style.display = "none";
  }
  async #checkAnswers() {
    document.querySelectorAll("textarea").forEach((el) => {});
  }
}
