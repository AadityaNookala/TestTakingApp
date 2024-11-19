import { arrOfPuncs } from "../../../config.js";

class DisplayingSentence {
  createAnswers(randomTest, answer, i) {
    const sentence = randomTest.sentences[i].sentence.split(" ");
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
  }

  renderAnswers(i, text) {
    return `
            <span 
              class="word draggable" 
              draggable="true" 
              data-id="${i}"
              data-type="text">
              ${text.replace(/[^\w\s-]|_/g, "")}
            </span>
          `;
  }

  checkAnswers(
    sentence,
    answers,
    sentenceDiv,
    correctCount,
    totalCount,
    indexOfActualSentence,
    mistakenAnswers,
    sentenceIndex
  ) {
    const droppingSpans = Array.from(
      sentenceDiv.querySelectorAll(".dropping-span")
    );
    const arr = [];
    let temp = 0;
    droppingSpans.forEach((el, i) => {
      const answer = answers[totalCount].content.replace(/[^\w\s-]|_/g, "");
      const item = el.querySelector(".word");
      if (item) {
        if (item.textContent.trim() === answer) {
          arr.push(answer);
          correctCount++;
          temp++;
        } else {
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
    return { correctCount, totalCount };
  }

  addDragAndDropHandlers(event, draggable) {
    const id = draggable.getAttribute("data-id");
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.setData("word", event.target.textContent);
  }

  renderQuestions(answers, sentence, index) {
    const tokens = sentence.sentence.match(/(\S+|\s+)/g);
    const ranges = [];
    let start = answers[0];
    let end = answers[0];

    for (let i = 1; i < answers.length; i++) {
      if (answers[i] === answers[i - 1] + 1) {
        end = answers[i];
      } else {
        ranges.push([start, end]);
        start = answers[i];
        end = answers[i];
      }
    }
    ranges.push([start, end]);

    const newTokens = [];
    let i = 0;
    let rangeIndex = 0;

    while (i < tokens.length) {
      if (rangeIndex < ranges.length && i === ranges[rangeIndex][0]) {
        let punc = "";
        let puncOfBeginning = "";
        const arr = tokens[ranges[rangeIndex][1]].split("");
        const arrOfBeginning = tokens[i].split("");
        for (; arrOfPuncs.includes(arr[arr.length - 1]); ) {
          punc += arr.pop();
        }
        for (; arrOfPuncs.includes(arrOfBeginning[0]); ) {
          puncOfBeginning += arrOfBeginning.shift();
        }
        punc = punc.split("").reverse().join("");
        newTokens.push(
          `${puncOfBeginning}<span class="dropping-span" data-index="${i}"> <span class="drop drop-zone" data-id="${i}"></span> </span>${punc}`
        );
        i = ranges[rangeIndex][1] + 1;
        rangeIndex++;
      } else {
        newTokens.push(tokens[i]);
        i++;
      }
    }

    const modifiedSentence = newTokens.join("");

    return `<div class="sentence mb-5" data-index="${index}">
          ${
            sentence.imageUrl
              ? `<br><img src="${sentence.imageUrl}" alt="Image ${
                  index + 1
                }" class="masked-image" data-index="${i}"><br>`
              : ""
          }
          ${sentence.sentence ? `${index + 1}: ${modifiedSentence}` : ""}
        </div>`;
  }
}

export default new DisplayingSentence();
