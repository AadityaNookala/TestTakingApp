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
    <div class="image-container" style="position: relative;">
      <img class="image" src="${sentence.imageUrl}" crossOrigin="anonymous" />
  `;
      if (!sentence.sentence) {
        const maskedAreas = answer || [];
        const img = new Image();
        img.src = sentence.imageUrl;
        img.crossOrigin = "anonymous"; // Ensure cross-origin access

        await img.decode();

        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        if (!imageWidth || !imageHeight) {
          return html;
        }

        const canvasId = `canvas-${Math.random().toString(36).substring(2, 9)}`;
        html += `<canvas id="${canvasId}" width="${imageWidth}" height="${imageHeight}" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>`;

        setTimeout(() => {
          const canvas = document.getElementById(canvasId);
          if (canvas) {
            const ctx = canvas.getContext("2d");

            // Ensure canvas matches image dimensions
            canvas.width = imageWidth;
            canvas.height = imageHeight;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

            // Apply gray overlay to masked areas
            ctx.fillStyle = "rgba(128, 128, 128, 0.5)";
            maskedAreas.forEach((mask) => {
              if (
                typeof mask.x === "number" &&
                typeof mask.y === "number" &&
                typeof mask.width === "number" &&
                typeof mask.height === "number"
              ) {
                ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
              }
            });
          }
        }, 0);
      }
      html += "</div>";
    }
    return html;
  }
}

export default Adding;
