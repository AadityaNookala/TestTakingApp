import { baseUrl } from "../../../config.js";
import { uploadImage } from "../../../helpers/helpers.js";
import CommonKTSP from "../../../logics/adding/commonktsp.js";

class AddingImage {
  #modalBody;
  #fileInput;
  #saveButton;
  #isDrawing = false;
  #startX;
  #startY;
  #img;
  #masks = [];
  #file;

  constructor(input) {
    this.#modalBody = document.querySelector(".modal-body");

    this.#createBasicMarkup();

    this.#fileInput.addEventListener("change", this.#displayImage.bind(this));
    this.#saveButton.onclick = () => {
      this.#saveMaskedImage(input);
    };
    document.addEventListener("paste", this.#handlePaste.bind(this));
  }

  #createBasicMarkup() {
    this.#modalBody.innerHTML = `
    <input type="file" name="image" class="form-control modal-form-control" aria-label="file example" accept="image/*">
    <div id="canvas-container">
      <canvas id="image-canvas"></canvas>
    </div>
    `;

    this.#fileInput = document.querySelector(".modal-form-control");
    this.#saveButton = document.querySelector(".btn-default");
  }

  #displayImage(e) {
    this.#file = e.target.files[0];
    if (this.#file) {
      const reader = new FileReader();
      reader.onload = this.#readerOnload.bind(this);
      reader.readAsDataURL(this.#file);
    }
  }

  #readerOnload(e) {
    this.#img = new Image();
    this.#img.onload = this.#allowCreatingMask.bind(this);
    this.#img.src = e.target.result;
  }

  #allowCreatingMask() {
    const canvas = document.getElementById("image-canvas");
    const context = canvas.getContext("2d");
    canvas.width = this.#img.width;
    canvas.height = this.#img.height;
    context.drawImage(this.#img, 0, 0);
    canvas.onmousedown = this.#creatingMaskDiv.bind(this);
    canvas.onmousemove = this.#drawMaskDiv.bind(this);
    canvas.onmouseup = this.#deleteMaskDivFromDocument.bind(this);
    canvas.onmouseleave = this.#deleteMaskDivFromDocument.bind(this);
  }

  #creatingMaskDiv(e) {
    this.#isDrawing = true;
    this.#startX = e.offsetX;
    this.#startY = e.offsetY;
    this.#createMaskDiv(this.#startX, this.#startY, 0, 0);
  }

  #drawMaskDiv(e) {
    if (this.#isDrawing) {
      const currentX = e.offsetX;
      const currentY = e.offsetY;
      const width = currentX - this.#startX;
      const height = currentY - this.#startY;
      this.#updateMaskDiv(width, height);
    }
  }

  #deleteMaskDivFromDocument() {
    this.#isDrawing = false;
    this.#finalizeMaskDiv();
  }

  #createMaskDiv(x, y, width, height) {
    const maskDiv = document.createElement("div");
    maskDiv.classList.add("mask");
    maskDiv.style.left = x + "px";
    maskDiv.style.top = y + "px";
    maskDiv.style.width = width + "px";
    maskDiv.style.height = height + "px";
    maskDiv.addEventListener(
      "click",
      function () {
        maskDiv.remove();
        this.#masks = this.#masks.filter(
          (mask) =>
            !(
              mask.x === x &&
              mask.y === y &&
              mask.width === width &&
              mask.height === height
            )
        );
      }.bind(this)
    );
    document.getElementById("canvas-container").appendChild(maskDiv);
    document.currentMaskDiv = maskDiv;
  }

  #updateMaskDiv(width, height) {
    const maskDiv = document.currentMaskDiv;
    if (maskDiv) {
      maskDiv.style.width = width + "px";
      maskDiv.style.height = height + "px";
    }
  }

  #finalizeMaskDiv() {
    const maskDiv = document.currentMaskDiv;
    if (maskDiv) {
      const rect = maskDiv.getBoundingClientRect();
      this.#masks.push({
        x: parseInt(maskDiv.style.left, 10),
        y: parseInt(maskDiv.style.top, 10),
        width: rect.width,
        height: rect.height,
      });
    }
    document.currentMaskDiv = null;
  }

  async #saveMaskedImage(input) {
    const typeOfChange = input
      .closest(".row")
      .querySelector("button")
      .dataset.typeOfChange.trim();
    const activeIndex = +input.closest(".row").dataset.index;
    const imageUrl = await uploadImage(baseUrl);
    const data = {};
    data.answers = this.#masks;

    data.sentences = {};
    if (imageUrl) data.sentences.imageUrl = imageUrl;


    const common = new CommonKTSP();
    await common.sendForKeyTermsAndSpellings(data, typeOfChange, activeIndex);
  }

  #handlePaste(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = this.#readerOnload.bind(this);
        reader.readAsDataURL(blob);
      }
    }
  }
}

export default AddingImage;
