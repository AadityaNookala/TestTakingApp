"use strict";

import AddingSentence from "../../helpers/adding/keyterms/AddingSentence.js";
import AddingImage from "../../helpers/adding/keyterms/AddingImage.js";

class Adding {
  showingModal(input) {
    document.querySelector(".modal-body").textContent = "";
    if (!input.value.trim()) new AddingImage(input);
    else new AddingSentence(input);
  }
}

export default Adding;
