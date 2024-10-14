"use strict";

import AddingSentence from "./helpers/KeyTermsAddingSentence.js";
import AddingImage from "./helpers/KeyTermsAddingImage.js";
import { baseUrl, bucketName } from "../../../config.js";

class Adding {
  showingModal(input) {
    document.querySelector(".modal-body").textContent = "";
    if (!input.value.trim()) new AddingImage(input);
    else new AddingSentence(input);
  }
}

export default Adding;
