"use strict";

import { baseUrl, sendAPI } from "../../config.js";

class Adding {
  #data;
  #addingButton;
  #form;
  #numberOfWords;
  #modal;
  constructor() {
    (async () => {
      this.#form = document.querySelector("form");
      this.#numberOfWords = 0;
      this.#modal = document.querySelector(".modal");
      this.#data = (
        await sendAPI(
          "GET",
          `${baseUrl}/test/${new URLSearchParams(window.location.search).get(
            "testName"
          )}`
        )
      ).data.test;
      this.#render();
    })();
  }

  #makeUpHTML(section, element, index) {
    if (element.includes(section)) {
      this.#form.insertAdjacentHTML(
        "beforeend",
        `
          <div class="row" data-index="${index}">
            <div class="col-1">${++this.#numberOfWords}</div>
            <div class="col-7"><img class="img" src="${element}" alt="url"></div>
            <div class="col-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path>
              </svg>
            </div>
          </div>`
      );
    }
  }

  #render() {
    document.querySelector(".row")?.remove();
    document.querySelector(".add")?.remove();
    document
      .querySelector(".heading")
      .insertAdjacentHTML(
        "beforeend",
        `<br><span class="section-1">Section 1</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="section-2">Section 2</span>`
      );
    document.querySelector(".spinner-border").style.display = "none";
    document.querySelector(".section-1").addEventListener("click", () => {
      this.#numberOfWords = 0;
      this.#form.innerHTML = `<p class="section-heading">Section 1 <button class="add" type="button" data-type="section-1">Add a new question</button></p>`;
      this.#form.insertAdjacentHTML(
        "beforeend",
        `<div class="row header">
          <div class="col-1">#</div>
          <div class="col-7">Sentence</div>
          <div class="col-1 edit">Edit</div>
        </div>`
      );
      this.#data.sentences.forEach((element, i) => {
        this.#makeUpHTML("section1", element, i);
      });
      this.#addingButton = document.querySelector(".add");
      this.#addingButton.addEventListener(
        "click",
        this.#handleClickOnAddingButton.bind(this)
      );
      document.addEventListener("click", this.#handleClickOnEdit.bind(this));
    });
    document.querySelector(".section-2").addEventListener("click", () => {
      this.#numberOfWords = 0;
      this.#form.innerHTML = `<p class="section-heading">Section 2 <button class="add" type="button" data-type="section-2">Add a new question</button></p>`;
      this.#form.insertAdjacentHTML(
        "beforeend",
        `<div class="row header">
          <div class="col-1">#</div>
          <div class="col-7">Sentence</div>
          <div class="col-1 edit">Edit</div>
        </div>`
      );
      this.#data.sentences.forEach((element, i) => {
        this.#makeUpHTML("section2", element, i);
      });
      this.#addingButton = document.querySelector(".add");
      this.#addingButton.addEventListener(
        "click",
        this.#handleClickOnAddingButton.bind(this)
      );
      document.addEventListener("click", this.#handleClickOnEdit.bind(this));
    });
  }

  #handleClickOnAddingButton(e) {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
    e.preventDefault();
    this.#form.insertAdjacentHTML(
      "beforeend",
      `<div class="row active-adding" data-index="${this.#numberOfWords++}">
        <div class="col-1">${this.#numberOfWords}</div>
        <div class="col-7">
          <input type="file" class="form-control question-form-control" aria-label="file example" accept="image/*">
        </div>
        <div class="col-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path>
          </svg>
        </div>
        <button class="add-word" data-bs-toggle="modal" data-bs-target="#myModal" type="button" data-type-of-change="adding">Add</button>
      </div>`
    );
    document.querySelector(".add-word").addEventListener("click", () => {
      if (this.#addingButton.dataset.type === "section-1") {
        this.#section1Modal("adding", this.#data.sentences.length + 1);
      } else {
        this.#section2Modal("adding", this.#data.sentences.length + 1);
      }
    });
  }

  #handleClickOnEdit(e) {
    if (!e.target.closest(".w-6")) return;
    const edit = e.target.closest(".w-6");
    const row = edit.closest(".row");
    row.classList.add("active-adding");
    const sentenceRow = row.querySelector(".col-7");
    sentenceRow.innerHTML = `<input type="file" class="form-control" aria-label="file example" accept="image/*">`;
    row.insertAdjacentHTML(
      "beforeend",
      `<button class="edit-word" data-bs-toggle="modal" data-bs-target="#myModal" type="button" data-type-of-change="editing">Edit</button>`
    );

    document.querySelector(".edit-word").onclick = () => {
      if (this.#addingButton.dataset.type === "section-1") {
        this.#section1Modal("editing", +row.dataset.index);
      } else {
        this.#section2Modal("editing", +row.dataset.index);
      }
    };
  }

  #section1Modal(type, index) {
    this.#modal.querySelector(".modal-title").textContent =
      "Which answer do you want?";
    this.#modal.querySelector(".modal-body").innerHTML = `
      Answer:
      <br>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" value="A">
        <label class="form-check-label" for="flexRadioDefault1">A</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" value="B">
        <label class="form-check-label" for="flexRadioDefault2">B</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" value="C">
        <label class="form-check-label" for="flexRadioDefault3">C</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault4" value="D">
        <label class="form-check-label" for="flexRadioDefault4">D</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault5" value="E">
        <label class="form-check-label" for="flexRadioDefault5">E</label>
      </div>
    `;

    this.#modal.querySelector(".btn-default").onclick = async () => {
      const split = this.#data.sentences[index].split("/");
      const formData = new FormData();
      const fileInput = document.querySelector(".form-control");
      const file = fileInput.files[0];
      formData.append(
        "questionImage",
        file,
        `${
          type === "adding"
            ? `section1-questionImage-${crypto.randomUUID()}.png`
            : `${split[split.length - 1]}`
        }`
      );

      const radios = document.querySelectorAll(".form-check-input");
      let value;
      radios.forEach((el) => {
        if (el.checked) {
          value = el.value;
        }
      });
      formData.append("answer", value);
      formData.append(
        "testName",
        new URLSearchParams(window.location.search).get("testName")
      );
      if (type === "adding") {
        await (
          await fetch(`${baseUrl}/ap/upload-image`, {
            method: "POST",
            body: formData,
          })
        ).json();
      } else {
        await (
          await fetch(`${baseUrl}/ap/edit-question`, {
            method: "PATCH",
            body: formData,
          })
        ).json();
      }
      document.querySelector(
        "form"
      ).innerHTML = `<p class="section-heading">Section 1 <button class="add" type="button" data-type="section-1">Add a new question</button></p><div class="row header">
          <div class="col-1">#</div>
          <div class="col-7">Sentence</div>
          <div class="col-1 edit">Edit</div>
        </div>`;
      this.#data = (
        await sendAPI(
          "GET",
          `${baseUrl}/test/${new URLSearchParams(window.location.search).get(
            "testName"
          )}`
        )
      ).data.test;
      this.#numberOfWords = 0;
      this.#data.sentences.forEach((element) => {
        this.#makeUpHTML("section1", element);
      });
    };
  }

  #section2Modal() {
    this.#modal.querySelector(".modal-title").textContent =
      "Please upload an answer";
    this.#modal.querySelector(".modal-body").innerHTML = `
      Answer:
      <br>
      <input type="file" class="form-control modal-form-control" aria-label="file example" accept="image/*">
      <button class="add-file">Add another choose file</button>
    `;
    this.#attachAddFileListener();
  }

  async #attachAddFileListener() {
    const addButton = document.querySelector(".add-file");
    addButton.onclick = () => {
      addButton.remove();
      this.#modal.querySelector(".modal-body").insertAdjacentHTML(
        "beforeend",
        `<input type="file" class="form-control modal-form-control" aria-label="file example" accept="image/*">
         <button class="add-file">Add another choose file</button>`
      );

      this.#attachAddFileListener();
    };
    this.#modal.querySelector(".btn-default").onclick = async () => {
      const formData = new FormData();
      const fileInput = document.querySelector(".question-form-control");
      const file = fileInput.files[0];
      console.log(file);
      formData.append(
        "questionImage",
        file,
        `section2-questionImage-${crypto.randomUUID()}.png`
      );
      const fileInputAnswer = document.querySelectorAll(".modal-form-control");
      fileInputAnswer.forEach((el) =>
        formData.append(
          "answerImage",
          el.files[0],
          `section2-answerImage-${crypto.randomUUID()}.png`
        )
      );
      formData.append(
        "testName",
        new URLSearchParams(window.location.search).get("testName")
      );
      await fetch(`${baseUrl}/ap/upload-image-for-section2`, {
        method: "POST",
        body: formData,
      });
      document.querySelector(
        "form"
      ).innerHTML = `<p class="section-heading">Section 2 <button class="add" type="button" data-type="section-2">Add a new question</button></p><div class="row header">
          <div class="col-1">#</div>
          <div class="col-7">Sentence</div>
          <div class="col-1 edit">Edit</div>
        </div>
        `;
      this.#data = (
        await sendAPI(
          "GET",
          `${baseUrl}/test/${new URLSearchParams(window.location.search).get(
            "testName"
          )}`
        )
      ).data.test;
      this.#numberOfWords = 0;
      this.#data.sentences.forEach((element) => {
        this.#makeUpHTML("section2", element);
      });
    };
  }
}

export default Adding;
