"use strict";

import { default as Common } from "./common.js";
import { imageUrlStartsWith } from "../../config.js";

class Displaying extends Common {
  #fixed;
  #sentencesContainer;
  #answers = [];
  #defaultDroppingSpanValue;
  #check;

  constructor() {
    super();
    (async () => {
      try {
        await this.getRandomTest();
        if (!this.randomTest) {
          throw new Error("Failed to load random test data.");
        }
        console.log(this.randomTest);
        document.querySelector(".container").insertAdjacentHTML(
          "beforeend",
          `<div class="fixed"></div>
           <div class="sentences"></div>`
        );
        this.#fixed = document.querySelector(".fixed");
        this.#sentencesContainer = document.querySelector(".sentences");
        this.#defaultDroppingSpanValue =
          "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        await this.#renderPage();
      } catch (error) {
        console.error("Error initializing Displaying class:", error);
        // Optionally, display an error message to the user
      }
    })();
  }

  async #renderPage() {
    await this.#renderDraggables();
    await this.#renderQuestions();
    this.#addDragAndDropHandlers();
  }

  async #renderDraggables() {
    await this.#createAnswers();
    this.#renderAnswers();
  }

  async #createAnswers() {
    this.#answers = await Promise.all(
      this.randomTest.answers.map(async (answer, i) => {
        if (typeof answer[0] === "number") {
          // Handle text-based answers
          const sentence = this.randomTest.sentences[i].sentence.split(" ");
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
        } else {
          // Handle image-based answers by masking
          const maskedParts = [];
          const imageUrl = this.randomTest.sentences[i].imageUrl;

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
              console.error(`Failed to load image at ${imageUrl}`);
              reject(new Error(`Failed to load image at ${imageUrl}`));
            };

            img.src = imageUrl;
          });
        }
      })
    );
  }

  #renderAnswers() {
    const fixedContainer = document.querySelector(".fixed");
    const randomAnswers = this.#randomizeArray(this.#answers);
    let html = "";

    randomAnswers.forEach((ans, i) => {
      if (ans.type === "image") {
        // Image-based answers
        ans.content.forEach((maskedPart, index) => {
          html += `
            <span 
              class="word" 
              draggable="true" 
              id="word-span-${i}-${index}" 
              data-id="${maskedPart.id}" 
              data-type="image">
              <img src="${maskedPart.maskedImageURL}" alt="Masked Part ${maskedPart.id}" class="img" />
            </span>
          `;
          console.log(
            `Rendered Draggable Image: ID=word-span-${i}-${index}, data-id=${maskedPart.id}`
          );
        });
      } else if (ans.type === "text") {
        // Text-based answers
        ans.content.forEach((text, index) => {
          html += `
            <span 
              class="word" 
              draggable="true" 
              id="word-span-${i}-${index}" 
              data-type="text">
              ${text}
            </span>
          `;
          console.log(`Rendered Draggable Text: ID=word-span-${i}-${index}`);
        });
      } else {
        console.warn(`Unknown answer type at index ${i}:`, ans);
      }
    });

    fixedContainer.insertAdjacentHTML("afterbegin", html);
  }

  #randomizeArray(arr) {
    const newArray = arr.flat();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  async #renderQuestions() {
    for (let i = 0; i < this.randomTest.sentences.length; i++) {
      const sentence = this.randomTest.sentences[i];
      const newSentence = sentence.sentence ? sentence.sentence.split(" ") : [];

      // Insert spaces between words for better spacing
      for (let j = 0; j < newSentence.length - 1; j += 2)
        newSentence.splice(j + 1, 0, " ");

      const answer = this.randomTest.answers[i][0];
      if (typeof answer === "number") {
        // Handle text-based answers by inserting drop zones
        this.randomTest.answers[i].forEach((ans) => {
          newSentence[ans] = `<span class="dropping-span"><span class="word">${
            this.#defaultDroppingSpanValue
          }</span></span>`;
        });

        // Remove duplicate blanks
        for (let j = 0; j < newSentence.length - 1; j++) {
          if (newSentence[j] === newSentence[j + 1]) {
            newSentence.splice(j, 1);
            j = -1; // Reset loop after splice
          }
        }

        // Assign data-index to drop zones
        for (let j = 0; j < newSentence.length; j++) {
          if (newSentence[j].startsWith("<span")) {
            newSentence[j] = `<span class="dropping-span" data-index="${j}">
              <span class="word">${this.#defaultDroppingSpanValue}</span>
            </span>`;
          }
        }

        // Insert the sentence into the DOM
        this.#sentencesContainer.insertAdjacentHTML(
          "beforeend",
          `
          <div class="sentence mb-5" data-index="${i}">
            ${
              sentence.imageUrl
                ? `<br><img src="${sentence.imageUrl}" alt="Image ${
                    i + 1
                  }" class="masked-image" data-index="${i}"><br>`
                : ""
            }
            ${sentence.sentence ? `${i + 1}: ${newSentence.join(" ")}` : ""}
          </div>
          `
        );
      } else {
        // Handle image-based answers by masking
        const imageUrl = sentence.imageUrl;
        const masks = this.randomTest.answers[i]; // Array of mask objects

        // Assign unique IDs to masks if they don't have them
        masks.forEach((mask, index) => {
          if (!mask.id) {
            mask.id = `mask${index + 1}`;
          }
        });

        try {
          const maskedImageData = await this.#maskImage(imageUrl, masks);
          const maskedImageURL = maskedImageData.maskedImageURL;
          const naturalWidth = maskedImageData.naturalWidth;
          const naturalHeight = maskedImageData.naturalHeight;

          // Insert the masked image along with the sentence
          this.#sentencesContainer.insertAdjacentHTML(
            "beforeend",
            `
            <div class="sentence mb-5" data-index="${i}">
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
                    (mask) => `
                      <div 
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
                      </div>
                    `
                  )
                  .join("")}
              </div>
              ${sentence.sentence ? `${i + 1}: ${newSentence.join(" ")}` : ""}
            </div>
            `
          );

          // After inserting, update drop zones with percentage-based positions
          const maskedImage = this.#sentencesContainer.querySelector(
            `.masked-image[data-index="${i}"]`
          );
          const dropZones = this.#sentencesContainer.querySelectorAll(
            `.drop-zone[data-id^="mask"]`
          );

          maskedImage.addEventListener("load", () => {
            const naturalW = maskedImage.naturalWidth;
            const naturalH = maskedImage.naturalHeight;
            const renderedW = maskedImage.clientWidth;
            const renderedH = maskedImage.clientHeight;

            const scaleX = renderedW / naturalW;
            const scaleY = renderedH / naturalH;

            dropZones.forEach((zone, idx) => {
              const mask = masks[idx];
              // Calculate percentage positions
              const xPercent = (mask.x / naturalW) * 100;
              const yPercent = (mask.y / naturalH) * 100;
              const widthPercent = (mask.width / naturalW) * 100;
              const heightPercent = (mask.height / naturalH) * 100;

              // Update mask with percentage values
              mask.xPercent = xPercent;
              mask.yPercent = yPercent;
              mask.widthPercent = widthPercent;
              mask.heightPercent = heightPercent;

              // Apply percentage-based styles
              zone.style.left = `${mask.xPercent}%`;
              zone.style.top = `${mask.yPercent}%`;
              zone.style.width = `${mask.widthPercent}%`;
              zone.style.height = `${mask.heightPercent}%`;
            });
          });
        } catch (error) {
          console.error(`Error masking image for sentence ${i}:`, error);
          // Optionally, insert the original image or a placeholder
          this.#sentencesContainer.insertAdjacentHTML(
            "beforeend",
            `
            <div class="sentence mb-5" data-index="${i}">
              <br><img src="${imageUrl}" alt="Image ${
              i + 1
            }" class="masked-image" data-index="${i}"><br>
              ${sentence.sentence ? `${i + 1}: ${newSentence.join(" ")}` : ""}
            </div>
            `
          );
        }
      }
    }

    // Add Check and Reset buttons
    this.#sentencesContainer.insertAdjacentHTML(
      "beforeend",
      `<button class="check btn btn-primary mt-4">Check your answers!</button>
       <button class="reset btn btn-secondary mt-4">Reset Answers</button>`
    );

    // Attach event listeners
    this.#check = document.querySelector(".check");
    this.#check.addEventListener("click", () => this.checkAnswers());

    const resetButton = document.querySelector(".reset");
    resetButton.addEventListener("click", () => this.resetAnswers());

    // Hide Spinner if exists
    const spinner = document.querySelector(".spinner-border");
    if (spinner) {
      spinner.style.display = "none";
    }
  }

  // Placeholder for checkAnswers method
  checkAnswers() {
    // Implement your answer checking logic here
    console.log("Checking answers...");
  }

  // Drag-and-Drop Handlers
  #addDragAndDropHandlers() {
    // Select all draggable items
    const draggableItems = document.querySelectorAll('.word[draggable="true"]');

    draggableItems.forEach((item) => {
      item.addEventListener("dragstart", this.#handleDragStart.bind(this));
    });

    // Select all drop zones
    const dropZones = document.querySelectorAll(".drop-zone");

    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", this.#handleDragOver.bind(this));
      zone.addEventListener("drop", this.#handleDrop.bind(this));
    });
  }

  // Drag Start Handler
  #handleDragStart(event) {
    const target = event.currentTarget;
    const type = target.getAttribute("data-type");
    if (type === "image") {
      const id = target.getAttribute("data-id");
      event.dataTransfer.setData("text/plain", id);
      event.dataTransfer.effectAllowed = "move";
    } else if (type === "text") {
      const text = target.textContent;
      event.dataTransfer.setData("text/plain", text);
      event.dataTransfer.effectAllowed = "copy";
    }
  }

  // Drag Over Handler
  #handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move"; // or 'copy' for text
  }

  // Drop Handler
  // Drop Handler
  #handleDrop(event) {
    event.preventDefault();
    const dropZone = event.currentTarget;
    const dropZoneId = dropZone.getAttribute("data-id");

    const draggedData = event.dataTransfer.getData("text/plain");

    console.log(`Drop Zone ID: ${dropZoneId}`);
    console.log(`Dragged Data ID: ${draggedData}`);

    if (dropZoneId) {
      // For image-based drop zones
      const draggable = document.querySelector(
        `.word[data-id="${draggedData}"]`
      );
      if (draggable) {
        const imgElement = draggable.querySelector("img");
        console.log(imgElement);
        if (imgElement) {
          // Remove existing image in drop zone, if any
          if (dropZone.firstChild) {
            const existingImg = dropZone.querySelector("img");
            if (existingImg) {
              dropZone.removeChild(existingImg);
            }
          }

          // Append the dragged image to the drop zone
          dropZone.appendChild(imgElement);
          console.log(dropZone);
          draggable.remove(); // Remove the draggable from the fixed container
          imgElement.setAttribute("draggable", "false"); // Prevent further dragging

          // Ensure the image fills the drop zone precisely
          imgElement.style.width = "100%";
          imgElement.style.height = "100%";
          imgElement.style.objectFit = "cover";
        } else {
          console.error(
            `Image element not found within draggable item with data-id "${draggedData}".`
          );
        }
      } else {
        console.error(
          `Draggable item with data-id "${draggedData}" not found.`
        );
      }
    } else {
      // Handle text-based drop zones if applicable
      // Implement similar logic for text-based drops
    }
  }

  // Masking method inside the class
  #maskImage(imageUrl, masks) {
    return new Promise((resolve, reject) => {
      // Create a new Image element
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Enable CORS to avoid tainted canvas

      img.onload = () => {
        try {
          // Create a canvas element
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the original image onto the canvas
          ctx.drawImage(img, 0, 0);

          // Set the fill style to white for masking
          ctx.fillStyle = "#ffcb9a"; // Adjust as needed

          // Iterate through each mask and draw a white rectangle
          masks.forEach((mask, index) => {
            // Validate mask properties
            if (
              typeof mask.x !== "number" ||
              typeof mask.y !== "number" ||
              typeof mask.width !== "number" ||
              typeof mask.height !== "number"
            ) {
              console.error(`Invalid mask at index ${index}:`, mask);
              return; // Skip invalid masks
            }

            ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
          });

          // Convert the canvas content to a data URL
          const maskedImageURL = canvas.toDataURL("image/png");

          // Resolve the promise with maskedImageURL and natural dimensions
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

      // Set the image source to trigger loading
      img.src = imageUrl;
    });
  }
}

export default Displaying;
