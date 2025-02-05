import { baseUrl } from "../../config.js";
import { sendAPI, uploadImage } from "../../helpers/helpers.js";

class AddingChoiceForge {
  #multipleChoice = [];
  #saveButton;

  constructor() {
    this.#saveButton = document.querySelector(".btn-default");
    this.#saveButton.onclick = this.#save.bind(this);
  }

  showImageAndChoices(sentence, answer) {
    console.log(sentence.choices);
    return `${
      sentence.imageUrl
        ? `<img src="${sentence.imageUrl}" alt="question" />`
        : ""
    }
    <br>
    <br>
    <br>
    <br>
    <div class="choices">
      ${sentence.choices
        .map(
          (choice, i) => `
          <div class=${answer.index === i ? "highlight-container" : ""}>
                <p class=${answer.index === i ? "highlight-choice" : ""}>${
            choice.choice ? choice.choice : ""
          }
                </p>
                ${
                  choice.imageUrl
                    ? `<img src="${choice.imageUrl}" alt="choice" />`
                    : ""
                }
        </div>`
        )
        .join("")}
    </div>`;
  }

  displayForm() {
    return `
    <input type="file" name="questionImage" class="modal-form-control" accept="image/*" />
    <button class="add-choice">Add new choice</button>
    `;
  }

  addChoice(e) {
    e.preventDefault();
    const inputColumn = e.target.closest(".input-column");
    inputColumn.insertAdjacentHTML(
      `beforeend`,
      `<div class="save-choice-div">
      ${
        this.#multipleChoice.length + 1
      }. <textarea class="input-add-choice"></textarea>
      <button class="save-choice">Save choice</button></div>
      <input type="file" name="choiceImage${
        this.#multipleChoice.length
      }" class="modal-form-control" accept="image/*" />
      `
    );
    const saveChoice = inputColumn.querySelector(".save-choice");
    saveChoice.addEventListener("click", this.#saveChoice.bind(this));
  }

  #saveChoice(e) {
    e.preventDefault();
    const inputColumn = e.target.closest(".input-column");
    const inputAddChoice = inputColumn.querySelector(".input-add-choice");
    this.#multipleChoice.push(inputAddChoice.value);
    const saveChoiceDiv = inputColumn.querySelector(".save-choice-div");
    saveChoiceDiv.remove();
    inputColumn.insertAdjacentHTML(
      "beforeend",
      `
      <div>
        <input type="radio" name="multiple-choice" value="${
          this.#multipleChoice.length - 1
        }" />
        <label>
          ${inputAddChoice.value}
        </label>
      </div>
      `
    );
  }

  showingModal() {
    document.querySelector(".modal-body").textContent = "";
    document.querySelector(".modal-body").insertAdjacentHTML(
      "beforeend",
      `Enter your solution: <br> <div class="solution-div"><textarea class="solution"></textarea>
        <input type="file" name="solutionImage" class="modal-form-control" accept="image/*" /></div>`
    );
  }

  async #save() {
    const question = document.querySelector(".input-sentence").value;
    const solution = document.querySelector(".solution").value;
    const index = +document.querySelector(
      "input[name='multiple-choice']:checked"
    ).value;
    const activeIndex = +document.querySelector(".input-column").closest(".row")
      .dataset.index;
    const data = {
      answers: {
        index,
      },
      sentences: {
        choices: this.#multipleChoice.map((multipleChoiceValue) => {
          return { choice: multipleChoiceValue };
        }),
      },
    };

    if (solution) data.answers.solution = solution;
    if (question) data.sentences.sentence = question;

    (await uploadImage(baseUrl)).forEach((el) => {
      if (!el) return;
      if (el.name === "questionImage") data.sentences.imageUrl = el.imageUrl;
      else if (el.name === "solutionImage") data.answers.imageUrl = el.imageUrl;
      else if (el.name.startsWith("choiceImage")) {
        const index = +el.name.split("choiceImage")[1];
        data.sentences.choices[index].imageUrl = el.imageUrl;
        if (!data.sentences.choices[index].choice)
          delete data.sentences.choices[index].choice;
      }
    });

    await sendAPI(
      "PATCH",
      `${baseUrl}/test/${
        document.querySelector(".heading").textContent
      }?currentIndex=${activeIndex}`,
      data
    );
    location.reload();
  }
}

export default AddingChoiceForge;
