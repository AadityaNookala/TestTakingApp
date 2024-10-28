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
    this.#addDragAndDropHandlers(); // Ensure this method exists to handle drag-and-drop
  }

  async #renderDraggables() {
    await this.#createAnswers();
    this.#renderAnswers();
  }

  async #createAnswers() {
    this.#answers = await Promise.all(
      this.randomTest.answers.map(async (answer, i) => {
        if (typeof answer[0] === "number") {
          const sentence = this.randomTest.sentences[i].sentence.split(" ");
          for (let i = 0; i < sentence.length - 1; i += 2)
            sentence.splice(i + 1, 0, " ");
          const storedAnswer = [];
          let word = "";
          for (let i = 0; i < answer.length; i++) {
            word += sentence[answer[i]];
            if (answer[i] !== answer[i + 1] - 1) {
              storedAnswer.push(word);
              word = "";
            }
          }
          return storedAnswer;
        } else {
          const maskedParts = [];
          const imageUrl = this.randomTest.sentences[i].imageUrl;

          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = function () {
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

                maskedParts.push(dataURL);
              });
              resolve(maskedParts);
            };

            img.onerror = function () {
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
      if (!ans.startsWith(imageUrlStartsWith)) {
        html += `<span class="word" draggable="true" id="word-span-${i}">${ans}</span>`;
      } else {
        html += `<span class="word" draggable="true" id="word-span-${i}"><img src=${ans}></span>`;
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
    let num = 0;
    for (let i = 0; i < this.randomTest.sentences.length; i++) {
      const sentence = this.randomTest.sentences[i];
      const newSentence = sentence.sentence ? sentence.sentence.split(" ") : [];
      for (let j = 0; j < newSentence.length - 1; j += 2)
        newSentence.splice(j + 1, 0, " ");

      const answer = this.randomTest.answers[i][0];
      if (typeof answer === "number") {
        // Handle text-based answers by inserting drop zones
        this.randomTest.answers[i].forEach((ans) => {
          newSentence[
            ans
          ] = `<span class="dropping-span" data-index="${num}"><span class="word">${
            this.#defaultDroppingSpanValue
          }</span></span>`;
          num++;
        });

        // Clean up any duplicate blanks
        for (let j = 0; j < newSentence.length - 1; j++) {
          if (newSentence[j] === newSentence[j + 1]) {
            newSentence.splice(j, 1);
            j = -1; // Reset loop after splice
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

        try {
          const maskedImageURL = await this.#maskImage(imageUrl, masks);
          console.log(maskedImageURL);

          // Insert the masked image along with the sentence
          this.#sentencesContainer.insertAdjacentHTML(
            "beforeend",
            `
            <div class="sentence mb-5" data-index="${i}">
              <div class="masked-image-container" style="position: relative; display: inline-block;">
                <img src="${maskedImageURL}" alt="Masked Image ${
              i + 1
            }" class="masked-image">
                ${masks
                  .map(
                    (mask) => `
                  <div 
                    class="drop-zone" 
                    data-id="${mask.id}" 
                    style="
                      position: absolute;
                      left: ${mask.x}px;
                      top: ${mask.y}px;
                      width: ${mask.width}px;
                      height: ${mask.height}px;
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

    // Add Check Answers Button
    this.#sentencesContainer.insertAdjacentHTML(
      "beforeend",
      `<button class="check btn btn-primary mt-4">Check your answers!</button>`
    );
    this.#check = document.querySelector(".check");
    this.#check.addEventListener("click", () => this.checkAnswers());

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
    const type = event.target.getAttribute("data-type");
    if (type === "image") {
      const id = event.target.getAttribute("data-id");
      event.dataTransfer.setData("text/plain", id);
      event.dataTransfer.effectAllowed = "move";
    } else if (type === "text") {
      const text = event.target.textContent;
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
  #handleDrop(event) {
    event.preventDefault();
    const dropZone = event.currentTarget;
    const dropZoneId = dropZone.getAttribute("data-id");

    const draggedData = event.dataTransfer.getData("text/plain");

    const type = dropZone.getAttribute("data-type"); // You might need to set this

    if (dropZoneId) {
      // For image-based drop zones
      const draggable = document.querySelector(
        `.word[data-id="${draggedData}"]`
      );
      if (draggable && dropZoneId === draggedData) {
        // Append the dragged item to the drop zone
        dropZone.innerHTML = "";
        dropZone.appendChild(draggable);
        draggable.setAttribute("draggable", "false"); // Prevent further dragging
        // Optionally, add a class to indicate correct placement
        dropZone.classList.add("correct");
      } else {
        // Optionally, provide feedback for incorrect drop
        alert("Incorrect placement!");
      }
    } else {
      // Handle text-based drop zones if applicable
      // Similar logic for text
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
          ctx.fillStyle = "#ffcb9a";

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

            // Optional: Add a border around the masked area for debugging
            /*
            ctx.strokeStyle = '#FF0000'; // Red border
            ctx.lineWidth = 2;
            ctx.strokeRect(mask.x, mask.y, mask.width, mask.height);
            */
          });

          // Convert the canvas content to a data URL
          const maskedImageURL = canvas.toDataURL("image/png");

          // Resolve the promise with the masked image URL
          resolve(maskedImageURL);
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
