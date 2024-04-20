"use strict";

import { baseUrl, sendAPI, arrOfPuncs } from "../../config.js";

const add = document.querySelector(".add");
const form = document.querySelector("form");
const modalBody = document.querySelector(".modal-body");
const btnDefault = document.querySelector(".btn-default");
const heading = document.querySelector(".heading");
const url = window.location.href;

heading.textContent = decodeURIComponent(
  url.split("+")[url.split("+").length - 1]
);
let numberOfWords = 0;

const showing = function () {
  form.insertAdjacentHTML(
    "beforeend",
    ` <div class="row active-adding" data-index="${numberOfWords++}">
  <div class="col-1">${numberOfWords}
  </div>
  <div class="col-7">
  <input class="input-sentence" id="editing" type="text" name="sentences">
  </div>
  <div class="col-1">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
            </path>
          </svg>
  </div>
  <button class="add-word" data-bs-toggle="modal" data-bs-target="#myModal" type="button" data-type-of-change="adding">Add</button>
  </div>`
  );
  document.querySelector(".input-sentence").focus();
};

const showingModal = function () {
  const typeOfChange = this.closest(".row")
    .querySelector("button")
    .dataset.typeOfChange.trim();
  const arrayOfSpans = [];
  modalBody.textContent = "";
  const inputSentenceTest = this.value;
  const activeIndex = +this.closest(".row").dataset.index;
  const inputSentenceTestSplit = inputSentenceTest.split(" ");
  modalBody.insertAdjacentHTML("beforeend", `Sentence:   `);
  let count = 0;
  inputSentenceTestSplit.forEach(function (s, i) {
    const bool = arrOfPuncs.some((punc) => s.includes(punc));
    let punc = "";
    let punc2 = "";
    if (bool) {
      const arr = s.split("");
      for (; arrOfPuncs.includes(arr[arr.length - 1]); ) {
        punc += arr.pop();
      }
      for (; arrOfPuncs.includes(arr[0]); ) {
        punc2 += arr.shift();
      }
      s = arr.join("");
    }
    punc = punc.split("").reverse().join("");
    modalBody.insertAdjacentHTML(
      "beforeend",
      `${punc2}<span class="span-for-sentence-in-modal" data-index="${count}">${s}</span>${punc}&nbsp;`
    );
    count++;
  });
  modalBody.onclick = clickOnModalBody;
  btnDefault.addEventListener("click", async function () {
    const allHighlightedSpans = document.querySelectorAll(".highlight");
    allHighlightedSpans.forEach(function (s, i) {
      arrayOfSpans.push(+s.dataset.index);
    });
    form.requestSubmit();
  });
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(form)]);
    data.indexes = arrayOfSpans;
    if (typeOfChange === "adding") {
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${heading.textContent.trim()}?typeOfChange=adding`,
        {}
      );
    } else {
      await sendAPI(
        "PATCH",
        `${baseUrl}/version/${heading.textContent.trim()}?typeOfChange=${typeOfChange}&indexOfActualSentence=${activeIndex}`,
        {
          sentence: inputSentenceTest.trim(),
          indexes: arrayOfSpans,
        }
      );
    }
    await sendAPI(
      "PATCH",
      `${baseUrl}/test/${heading.textContent}?currentIndex=${activeIndex}`,
      data
    );
    location.reload();
  });
};
if (add) {
  add.addEventListener("click", function () {
    showing();
    const addWord = document.querySelector(".add-word");
    const inputSentence = document.querySelector(".input-sentence");
    addWord.addEventListener("click", showingModal.bind(inputSentence));
  });
}

const showWords = async function () {
  const category = (
    await sendAPI(
      "GET",
      `${baseUrl}/categories/isclone/${
        window.location.href.split("?")[1].split("+")[1]
      }`
    )
  ).data.clone.isClone;
  const data = (await sendAPI("GET", `${baseUrl}/test/${heading.textContent}`))
    .data.test;
  console.log(data);
  if (!category) {
    document.querySelector(".row").insertAdjacentHTML(
      "beforeend",
      `<div class="col-1">
    Edit
  </div>`
    );
  } else {
    document.querySelector(".add").remove();
  }
  const sentences = data.sentences;
  sentences.forEach(function (_, i) {
    form.insertAdjacentHTML(
      "beforeend",
      `<div class="row" data-index="${numberOfWords++}">
    <div class="col-1">${i + 1}</div>
    <div class="col-7">
    ${sentences[i]}
    </div>
    ${
      category
        ? ""
        : `<div class="col-1">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
              class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
              </path>
            </svg>
    </div>`
    }
    </div>`
    );
  });
};

showWords();

const clickOnModalBody = function (e) {
  if (
    e.target.classList.contains("span-for-sentence-in-modal") &&
    e.target.textContent.trim() !== ""
  ) {
    e.target.classList.toggle("highlight");
  }
};

document.addEventListener("click", function (e) {
  const edit = e.target.closest(".w-6");
  if (!edit) return;
  const row = edit.closest(".row");
  row.classList.add("active-adding");
  const sentenceRow = row.querySelector(".col-7");
  const textCont = sentenceRow.textContent.trim();
  sentenceRow.innerHTML = `<input class="input-sentence" id="editing" type="text" name="sentences">`;
  const input = sentenceRow.querySelector(".input-sentence");
  input.value = textCont;
  input.focus();
  row.insertAdjacentHTML(
    "beforeend",
    `<button class="edit-word" data-bs-toggle="modal" data-bs-target="#myModal" type="button" data-type-of-change="editing">Edit</button>`
  );
  document
    .querySelector(".edit-word")
    .addEventListener("click", showingModal.bind(input));
});

document.querySelector(".spinner-border").style.display = "none";
