"use strict";

import { baseUrl, sendAPI, arrOfPuncs } from "../../../config.js";
let url = window.location.href;
const urlDecoded = decodeURIComponent(url.split("?")[1]);
const heading = document.querySelector(".heading");
const length = urlDecoded.split("+").length;
const fixed = document.querySelector(".fixed");
const sentences = document.querySelector(".sentences");
const modal = document.querySelector(".my-modal");
const overlay = document.querySelector(".overlay");
const defaultDroppingSpanValue =
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
let randomTest;
if (length === 1) {
  randomTest = (
    await sendAPI("GET", `${baseUrl}/random/${urlDecoded.split("+")[0]}`)
  ).test;
  heading.textContent = `Random test`;
} else {
  if (length === 2) {
    randomTest = (
      await sendAPI(
        "GET",
        `${baseUrl}/random/${urlDecoded.split("+")[0]}?categoryName=${
          urlDecoded.split("+")[1]
        }`
      )
    ).test;
    heading.textContent = `Random test for ${urlDecoded.split("+")[1]}`;
  } else {
    randomTest = (
      await sendAPI("GET", `${baseUrl}/test/${urlDecoded.split("+")[2]}`)
    ).data.test;
    heading.textContent = `${urlDecoded.split("+")[2]} test`;
  }
}
const words = [];
let sentenceRandom = randomTest.sentences.map((sentence, i) => [sentence, i]);
let indexRandom = randomTest.indexes.slice();
const lengthSentenceRandom = sentenceRandom.length;
randomTest.sentences.forEach((_, i) => {
  const splitWordSentence = randomTest.sentences[i].split(" ");
  let wordSentence = [];
  randomTest.indexes[i].forEach((element) => {
    let some = splitWordSentence[element].trim();
    const bool = arrOfPuncs.some((punc) => some.includes(punc));
    if (bool) {
      const arr = some.split("");
      for (; arrOfPuncs.includes(arr[arr.length - 1]); ) arr.pop();
      for (; arrOfPuncs.includes(arr[0]); ) arr.shift();
      some = arr.join("");
    }
    wordSentence.push(some);
  });
  words.push(wordSentence);
});

const wordsFlatted = words.slice().flat();
const lengthWord = wordsFlatted.length;
let html = ``;
for (let i = 0; i < lengthWord; i++) {
  const index = Math.trunc(Math.random() * wordsFlatted.length);
  html += `<span class="word" draggable="true" id="word-span-${i}">${wordsFlatted[index]}</span>`;
  if (i % 2 !== 0) {
    fixed.insertAdjacentHTML("beforeend", `<div class="row">${html}</div>`);
    html = ``;
  }
  if (i === lengthWord - 1 && i % 2 === 0) {
    fixed.insertAdjacentHTML("beforeend", `<div class="row">${html}</div>`);
    html = ``;
  }

  wordsFlatted.splice(index, 1);
}
const actualAnswers = [];
let j = 0;
sentenceRandom = randomTest.sentences.map((sentence, i) => [sentence, i]);
indexRandom = randomTest.indexes.slice();
for (let i = 0; i < lengthSentenceRandom; i++) {
  const index = Math.trunc(Math.random() * sentenceRandom.length);
  let wordSentence = ``;
  const splitWordSentence = sentenceRandom[index][0].split(" ");
  const array = [];
  indexRandom[index].forEach((element, indexing) => {
    wordSentence = ` ${splitWordSentence[element]}`;
    const bool = arrOfPuncs.some((punc) => wordSentence.includes(punc));
    let punc = "";
    let punc2 = "";
    if (bool) {
      const arr = wordSentence.split("");
      for (; arrOfPuncs.includes(arr[arr.length - 1]); ) punc += arr.pop();
      arr.shift();
      for (; arrOfPuncs.includes(arr[0]); ) punc2 += arr.shift();
      wordSentence = arr.join("");
    }
    punc = punc.split("").reverse().join("");

    array.push(splitWordSentence.join(" ").trim());
    splitWordSentence[element] =
      punc2 +
      `<span class="dropping-span" id="dropping-span-${j}"><span class="word">${defaultDroppingSpanValue}</span></span>` +
      punc;
    j++;
    if (indexing === indexRandom[index].length - 1) {
      sentences.insertAdjacentHTML(
        "beforeend",
        `<div class="sentence mb-5" data-index=${sentenceRandom[index][1]}>
      ${i + 1}: ${splitWordSentence.join(" ")}
      </div>`
      );
    }
  });
  actualAnswers.push(array[0]);

  sentenceRandom.splice(index, 1);
  indexRandom.splice(index, 1);
}
sentenceRandom = randomTest.sentences.slice();

sentences.insertAdjacentHTML(
  "beforeend",
  `<button class="check">Check your answers!</button>`
);
const check = document.querySelector(".check");
check.addEventListener("click", async function () {
  const droppingSpans = Array.from(document.querySelectorAll(".sentence"))
    .map((el) => [el, +el.dataset.index])
    .sort((a, b) => a[1] - b[1])
    .map((el) => Array.from(el[0].querySelectorAll(".dropping-span")));
  let score = 0;
  let noOfWords = 0;
  const enteredAnswers = [];
  const indexOfMistake = [];
  droppingSpans.forEach((el, i) => {
    el.forEach((droppingSpanWord, j) => {
      noOfWords++;
      if (droppingSpanWord.querySelector(".word")) {
        if (
          droppingSpanWord.querySelector(".word").textContent.trim() ===
          words[i][j]
        ) {
          score++;
        } else {
          if (!droppingSpanWord.closest(".sentence").querySelector(".answer")) {
            droppingSpanWord
              .closest(".sentence")
              .insertAdjacentHTML(
                "beforeend",
                `<div class="answer">${
                  randomTest.sentences[
                    droppingSpanWord.closest(".sentence").dataset.index
                  ]
                }</div>`
              );
            indexOfMistake.push(
              droppingSpanWord.closest(".sentence").dataset.index
            );
            const arr = el.map((element) =>
              element.querySelector(".word").textContent.trim()
            );
            enteredAnswers.push(arr);
          }
        }
      } else {
        if (!droppingSpanWord.closest(".sentence").querySelector(".answer")) {
          droppingSpanWord
            .closest(".sentence")
            .insertAdjacentHTML(
              "beforeend",
              `<div class="answer">${
                randomTest.sentences[
                  droppingSpanWord.closest(".sentence").dataset.index
                ]
              }</div>`
            );
          indexOfMistake.push(
            droppingSpanWord.closest(".sentence").dataset.index
          );
        }
      }
    });
  });
  sentences.insertAdjacentHTML(
    "beforeend",
    `<div class="score">Score: ${score}/${noOfWords}</div>`
  );
  check.remove();
  const date = new Date();
  const dateMonthDayYear =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  const testName = randomTest.testName;
  const userName = window.location.href.split("?")[1].split("+")[0];
  await sendAPI("PATCH", `${baseUrl}/score`, {
    userName: userName,
    testName: testName,
    dates: dateMonthDayYear,
    enteredSentence: {
      indexOfActualSentence: indexOfMistake,
      mistakenWords: enteredAnswers,
      score,
    },
  });
});

fixed.addEventListener("click", async function (e) {
  const word = e.target.closest(".word");
  if (!word) return;
  modal.innerHTML = `
  <button class="btn--close-modal">×</button>
  <h2 class="modal__header"></h2>
  <div class="modal__form">
  <div class="meaning mt-5">
  </div>
<div class="spinner"><div class="spinner-border text-info hidden" role="status">
<span class="visually-hidden">Loading...</span>
</div></div>`;
  const meanings = (
    await sendAPI("GET", `${baseUrl}/categories/${randomTest.testName}`)
  ).data.meanings;
  if (!meanings) return;
  const closeModalButton = document.querySelector(".btn--close-modal");

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
  modal.insertAdjacentHTML(
    "beforeend",
    `<div class="spinner"><div class="spinner-border text-info" role="status">
  <span class="visually-hidden">Loading...</span>
</div></div>`
  );
  const meaning = (
    await sendAPI("GET", `${baseUrl}/word-meaning/${word.textContent.trim()}`)
  ).data;

  document.querySelector(".modal__header").innerHTML = word.textContent.trim();
  const modalForm = document.querySelector(".modal__form");
  let html = "";
  meaning.forEach((el, i) => {
    let synonyms = ``;
    let sentences = "";
    el.synonyms.forEach((synonym, i) => {
      synonyms += `${synonym}`;
      if (i !== el.synonyms.length - 1) {
        synonyms += ", ";
      }
    });
    el.sentences.forEach((sentence) => {
      sentences += `
      <li>
        ${sentence}
      </li>`;
    });
    html += `
    <div class="meaning mt-5">
      <span>${i + 1}.</span>
      <span>(${el.partOfSpeech})</span>
      <span class="definition">
        ${el.definition}
      </span>
      <ul class="meaning-sentences">
        ${sentences}
      </ul>
      Synonyms:
      <span class="synonyms">
        ${synonyms}
      </span>
    </div>
    `;
  });
  modalForm.innerHTML = html;
  modal.querySelector(".spinner-border").classList.add("hidden");
  closeModalButton.addEventListener("click", closeModal);

  overlay.addEventListener("click", closeModal);
});

function closeModal() {
  overlay.classList.add("hidden");
  modal.classList.add("hidden");
}
let idOfSentence;

fixed.addEventListener("dragstart", function (e) {
  if (e.target.classList.contains("fixed")) {
    e.preventDefault();
    return;
  }
  e.dataTransfer.setData("word", e.target.textContent);
  e.dataTransfer.setData("id", e.target.id);
  e.dataTransfer.setData("current", e.currentTarget.className);
});
sentences.addEventListener("dragstart", function (e) {
  if (e.target.classList.contains("sentences")) {
    e.preventDefault();
    return;
  }
  e.dataTransfer.setData("word", e.target.textContent);
  e.dataTransfer.setData("originalWord", e.target.closest(".dropping-span").id);
});

sentences.addEventListener("dragover", function (e) {
  if (!e.target.closest(".dropping-span")) return;
  e.preventDefault();
});

fixed.addEventListener("dragover", function (e) {
  e.preventDefault();
});

sentences.addEventListener("drop", function (e) {
  e.preventDefault();
  const dragged = e.dataTransfer.getData("word");
  const testCont = e.target.closest(".dropping-span").textContent;
  if (dragged === e.target.textContent) return;
  e.target.innerHTML = "";
  e.target.insertAdjacentHTML(
    "beforeend",
    `<span class="word" draggable="true">${dragged}</span>`
  );
  const id = e.dataTransfer.getData("id");
  if (id) {
    idOfSentence = id;
    document.querySelector(`#${id}`).remove();
  }
  if (!e.dataTransfer.getData("originalWord")) return;
  const originalWord = document.querySelector(
    `#${e.dataTransfer.getData("originalWord")}`
  );
  originalWord.textContent = testCont;
  originalWord.setAttribute("draggable", true);
});

fixed.addEventListener("drop", function (e) {
  e.preventDefault();
  const dragged = e.dataTransfer.getData("word");
  if (e.currentTarget.className === e.dataTransfer.getData("current")) return;
  e.target.insertAdjacentHTML(
    "beforeend",
    `<span class="word" draggable="true" id="${idOfSentence}">${dragged}</span>`
  );
  if (!e.dataTransfer.getData("originalWord")) return;
  document.querySelector(
    `#${e.dataTransfer.getData("originalWord")}`
  ).innerHTML = `<span class="span">${defaultDroppingSpanValue}</span>`;
});

document.querySelector(".spinner-border").style.display = "none";
