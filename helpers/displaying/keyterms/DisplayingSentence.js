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
              id="word-span-${i}" 
              data-id="${i}"
              data-type="text">
              ${text}
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
      const answer = answers[totalCount].content;
      const item = el.querySelector(".word");
      if (item) {
        if (item.textContent.trim() === answer) {
          arr.push(answer);
          correctCount++;
          temp++;
        } else {
          console.log(item.textContent.trim());
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
}

export default new DisplayingSentence();
