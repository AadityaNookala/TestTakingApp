"use strict";

import AddingSentence from "../../helpers/adding/keyterms/AddingSentence.js";
import AddingImage from "../../helpers/adding/keyterms/AddingImage.js";

class Adding {
  showingModal(input, sentence, answers) {
    document.querySelector(".modal-body").textContent = "";
    if (!input.value.trim()) new AddingImage(input);
    else new AddingSentence(input, sentence, answers);
  }

  async maskShowingImage(sentence, answer) {
    let html = "";
    if (sentence.imageUrl) {
      html += `
        <div class="image-container">
          <img class="image" src="${sentence.imageUrl}" />
      `;
      if (!sentence.sentence) {
        const maskedAreas = answer || [];
        const img = new Image();
        img.src = sentence.imageUrl;

        await img.decode();

        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;
        const canvasId = `mask-${Math.random().toString(36).substring(2, 9)}`;
        html += `<canvas id="${canvasId}" width="${imageWidth}" height="${imageHeight}" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>`;

        setTimeout(() => {
          const canvas = document.getElementById(canvasId);
          if (canvas.getContext) {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(128, 128, 128, 0.5)";

            maskedAreas.forEach((area) => {
              ctx.fillRect(area.x, area.y, area.width, area.height);
            });
          } else {
            console.error("Canvas not supported in this browser.");
          }
        }, 0);
      }
      html += "</div>";
    }
    return html;
  }
}

export default Adding;
