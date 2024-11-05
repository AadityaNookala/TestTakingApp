class DisplayingImage {
  createAnswers(randomTest, answer, i) {
    const maskedParts = [];
    const imageUrl = randomTest.sentences[i].imageUrl;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
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
          if (!mask.id) {
            mask.id = `mask${index + 1}`;
          }
          maskedParts.push({ id: mask.id, maskedImageURL: dataURL });
        });
        resolve({ type: "image", content: maskedParts });
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image at ${imageUrl}`));
      };

      img.src = imageUrl;
    });
  }

  renderAnswers(i, maskedPart) {
    return `
            <span 
              class="word draggable" 
              draggable="true" 
              id="word-span-${i}" 
              data-id="${maskedPart.id}" 
              data-type="image">
              <img src="${maskedPart.maskedImageURL}" alt="Masked Part ${maskedPart.id}" class="img" />
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
    const masks = answers;
    const arr = [];
    let temp = 0;
    masks.forEach((mask) => {
      const dropZone = sentenceDiv.querySelector(
        `.drop-zone[data-id="${mask.id}"]`
      );
      if (!dropZone) {
        console.warn(`Drop zone with data-id="${mask.id}" not found.`);
        return;
      }

      const draggable = dropZone.querySelector(".word.draggable");
      if (draggable) {
        let draggableId = draggable.getAttribute("data-id");
        if (draggableId === mask.id) {
          draggableId = draggableId.split("mask")[1] - 1;
          arr.push(answers[draggableId]);
          dropZone.style.border = "5px solid green";
          correctCount++;
          temp++;
        } else {
          draggableId = draggableId.split("mask")[1] - 1;
          arr.push(answers[draggableId]);
          dropZone.style.border = "5px solid red";
        }
        totalCount++;
      } else {
        totalCount++;
        arr.push("");
        dropZone.style.border = "5px solid red";
      }
    });
    if (masks.length !== temp) {
      indexOfActualSentence.push(sentenceIndex);
      mistakenAnswers.push(arr);
      sentenceDiv.insertAdjacentHTML(
        "beforeend",
        `<img src="${sentence.imageUrl}" />`
      );
    }
    return { correctCount, totalCount };
  }

  addDragAndDropHandlers(event, draggable) {
    const id = draggable.getAttribute("data-id");
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
    draggable.classList.add("dragging");
  }
}

export default new DisplayingImage();
