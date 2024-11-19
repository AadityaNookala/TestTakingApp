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
            mask.id = `mask${index + 1}-${i}`;
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

  async renderQuestions(i, sentence, masks) {
    const imageUrl = sentence.imageUrl;

    const maskedImageData = await this.#maskImage(imageUrl, masks);
    const maskedImageURL = maskedImageData.maskedImageURL;
    console.log(masks);
    return `<div class="sentence mb-5" data-index="${i}">
          <div class="masked-image-container" style="position: relative; display: inline-block;">
            <img 
              src="${maskedImageURL}" 
              alt="Masked Image ${i + 1}" 
              class="masked-image" 
              data-index="${i}"
              onload="this.dataset.naturalWidth = this.naturalWidth; this.dataset.naturalHeight = this.naturalHeight;"
            >
            ${masks
              .map(
                (mask) =>
                  `<div 
                    class="drop-zone" 
                    data-id="${mask.id}" 
                    style="
                      position: absolute;
                      left: 0%;
                      top: 0%;
                      width: 0%;
                      height: 0%;
                      box-sizing: border-box;
                      cursor: pointer;
                    ">
                  </div>`
              )
              .join("")}
          </div>
        </div>`;
  }

  #maskImage(imageUrl, masks) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          ctx.fillStyle = "#ffcb9a";

          masks.forEach((mask) => {
            ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
          });

          const maskedImageURL = canvas.toDataURL("image/png");

          resolve({
            maskedImageURL,
            naturalWidth: img.width,
            naturalHeight: img.height,
          });
        } catch (error) {
          reject(`Error while masking the image: ${error}`);
        }
      };

      img.onerror = () => {
        reject(
          "Failed to load the image. Please check the image URL and CORS settings."
        );
      };

      img.src = imageUrl;
    });
  }

  activateDropZones(masks, i) {
    const maskedImage = document
      .querySelector(".sentences")
      .querySelector(`.masked-image[data-index="${i}"]`);
    const dropZones = document
      .querySelector(".sentences")
      .querySelector(`.sentence[data-index="${i}"]`)
      .querySelectorAll(`.drop-zone[data-id^="mask"]`);

    const updateDropZones = () => {
      const naturalW = maskedImage.naturalWidth;
      const naturalH = maskedImage.naturalHeight;
      const displayedW = maskedImage.offsetWidth;
      const displayedH = maskedImage.offsetHeight;

      dropZones.forEach((zone, idx) => {
        const mask = masks[idx];

        // Adjust for actual displayed size
        zone.style.left = `${(mask.x / naturalW) * displayedW}px`;
        zone.style.top = `${(mask.y / naturalH) * displayedH}px`;
        zone.style.width = `${(mask.width / naturalW) * displayedW}px`;
        zone.style.height = `${(mask.height / naturalH) * displayedH}px`;
      });
    };

    maskedImage.addEventListener("load", updateDropZones);
    window.addEventListener("resize", updateDropZones);

    // Call once on activation
    updateDropZones();
  }
}

export default new DisplayingImage();
