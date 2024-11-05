class KeyTermsDisplayingImage {
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
}

export default new KeyTermsDisplayingImage();
