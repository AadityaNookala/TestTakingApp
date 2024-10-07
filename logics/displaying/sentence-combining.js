import { baseUrl, sendAPI } from "../../config.js";
import { default as Common } from "./common.js";

class Displaying extends Common {
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
    sentences.forEach((element, i) => {
      this.#sentences.insertAdjacentHTML(
        "beforeend",
        ` <div class="sentence-div">${i + 1}.<span class="sentence">${element
          .split("\n")
          .map((el, i) =>
            i === 0
              ? `${el}<br>`
              : `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${el}<br>`
          )
          .join(
            ""
          )}</span>&nbsp; &nbsp;<textarea class="sentences-input"></textarea><br></div>`
      );
    });
    this.#sentences.insertAdjacentHTML(
      "beforeend",
      `<button class="check">Check your answers!</button>`
    );
    this.#check = document.querySelector(".check");
    document.querySelector(".spinner-border").style.display = "none";
  }
  #getTextContentWithLineBreaks(element) {
    let textContent = "";

    function traverse(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        textContent += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "BR") {
          textContent += "\n";
        } else {
          for (let child of node.childNodes) {
            traverse(child);
          }
          if (node.tagName === "P" || node.tagName === "DIV") {
            textContent += "\n";
          }
        }
      }
    }
    traverse(element);
    textContent = textContent
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim();
    return textContent;
  }
  async #checkAnswers() {
    let score = 0;
    const indexOfMistake = [];
    const enteredAnswers = [];
    document.querySelectorAll("textarea").forEach((el) => {
      const textContent = this.#getTextContentWithLineBreaks(
        el.closest(".sentence-div").querySelector(".sentence")
      );
      const index = this.randomTest.sentences.indexOf(textContent);
      console.log(this.randomTest.sentences.indexOf(textContent));
      if (this.randomTest.answers[index].indexOf(el.value.trim()) !== -1) {
        if (this.randomTest.answers[index].length !== 1) {
          const halfBeforeTheUnwantedElement = this.randomTest.answers[
            index
          ].slice(
            0,
            this.randomTest.answers[
              this.randomTest.sentences.indexOf(textContent)
            ].indexOf(el.value.trim())
          );
          const halfAfterTheUnwantedElement = this.randomTest.answers[
            index
          ].slice(
            this.randomTest.answers[
              this.randomTest.sentences.indexOf(textContent)
            ].indexOf(el.value.trim()) + 1
          );
          const copyWithoutElement = halfBeforeTheUnwantedElement.concat(
            halfAfterTheUnwantedElement
          );
          copyWithoutElement.forEach((e) => {
            el.closest(".sentence-div").insertAdjacentHTML(
              "beforeend",
              `${e}<br>`
            );
          });
        }
        el.closest(".sentence-div").style.backgroundColor = "green";
        el.closest(".sentence-div").insertAdjacentHTML("afterend", "<br>");
        score++;
      } else {
        indexOfMistake.push(this.randomTest.sentences.indexOf(textContent));
        enteredAnswers.push(el.value.trim());
        this.randomTest.answers[index].forEach((e) => {
          el.closest(".sentence-div").insertAdjacentHTML(
            "beforeend",
            `${e}<br>`
          );
        });
        el.closest(".sentence-div").style.backgroundColor = "red";
        el.closest(".sentence-div").insertAdjacentHTML("afterend", "<br>");
      }
    });
    const noOfWords = this.randomTest.sentences.length;
    if (score === noOfWords) {
      console.log("hi");
      document.querySelector(".spinner-border").style.display = "block";
      this.sendAPIToScoresAndScheduler(
        enteredAnswers,
        indexOfMistake,
        score,
        noOfWords
      );
      document.querySelector(".spinner-border").style.display = "none";

      this.#check.remove();
      this.#sentences.insertAdjacentHTML(
        "afterend",
        `<div class="score">Score: ${score}/${noOfWords}`
      );
    } else {
      this.#check.remove();
      this.#sentences.insertAdjacentHTML(
        "afterend",
        `<div class="score">Score: ${score}/${noOfWords}
      <button class="peer-review">Need peer review</button>
      <button class="no-peer-review">Don't need peer review</button></div>`
      );
      document
        .querySelector(".no-peer-review")
        .addEventListener("click", () => {
          console.log("hi");
          document.querySelector(".spinner-border").style.display = "block";
          this.sendAPIToScoresAndScheduler(
            enteredAnswers,
            indexOfMistake,
            score,
            noOfWords
          );
          document.querySelector(".spinner-border").style.display = "none";

          document.querySelector(".no-peer-review").remove();
          document.querySelector(".peer-review").remove();
        });

      let noOfClicked = 0;
      const original = indexOfMistake.length;
      document.querySelector(".peer-review").addEventListener("click", () => {
        document.querySelector(".no-peer-review").remove();
        document.querySelector(".peer-review").remove();
        document.querySelectorAll("textarea").forEach((el) => {
          const textContent = this.#getTextContentWithLineBreaks(
            el.closest(".sentence-div").querySelector(".sentence")
          );
          const index = this.randomTest.sentences.indexOf(textContent);
          if (this.randomTest.answers[index].indexOf(el.value.trim()) === -1) {
            el.insertAdjacentHTML(
              "afterend",
              `<button class="correct">Mark as Correct</button><button class="incorrect">Mark as Incorrect</button>`
            );
          }
        });
        document
          .querySelector(".sentences")
          .addEventListener("click", async (e) => {
            if (e.target.closest(".correct")) {
              score++;
              document.querySelector(
                ".score"
              ).innerHTML = `Score: ${score}/${noOfWords}`;
              const textContent = this.#getTextContentWithLineBreaks(
                e.target
                  .closest(".correct")
                  .closest(".sentence-div")
                  .querySelector(".sentence")
              );
              const index = this.randomTest.sentences.indexOf(textContent);
              const otherIndex = enteredAnswers.indexOf(textContent);
              enteredAnswers.splice(otherIndex, 1);
              indexOfMistake.splice(otherIndex, 1);
              noOfClicked++;
              this.randomTest.answers[index].push(
                e.target
                  .closest(".correct")
                  .closest(".sentence-div")
                  .querySelector(".sentences-input").value
              );
              if (noOfClicked === original) {
                console.log("hi");
                document.querySelector(".spinner-border").style.display =
                  "block";
                this.sendAPIToScoresAndScheduler(
                  enteredAnswers,
                  indexOfMistake,
                  score,
                  noOfWords
                );
                await sendAPI("PATCH", `${baseUrl}/test/updatetest`, {
                  test: this.randomTest,
                });
                document.querySelector(".spinner-border").style.display =
                  "none";
              }
              e.target.closest(".sentence-div").style.backgroundColor = "green";
              e.target
                .closest(".correct")
                .closest(".sentence-div")
                .querySelector(".incorrect")
                .remove();
              e.target.closest(".correct").remove();
            } else if (e.target.closest(".incorrect")) {
              noOfClicked++;
              if (noOfClicked === original) {
                console.log("hi");
                document.querySelector(".spinner-border").style.display =
                  "inline-block";

                this.sendAPIToScoresAndScheduler(
                  enteredAnswers,
                  indexOfMistake,
                  score,
                  noOfWords
                );
                document.querySelector(".spinner-border").style.display =
                  "none";
              }
              e.target.closest(".sentence-div").style.backgroundColor = "red";
              e.target
                .closest(".incorrect")
                .closest(".sentence-div")
                .querySelector(".correct")
                .remove();
              e.target.closest(".incorrect").remove();
            }
          });
      });
    }
  }
}

export default Displaying;
