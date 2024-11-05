class KeyTermsDisplayingSentence {
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
}

export default new KeyTermsDisplayingSentence();
