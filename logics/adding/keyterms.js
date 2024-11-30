"use strict";

import AddingSentence from "../../helpers/adding/keyterms/AddingSentence.js";
import AddingImage from "../../helpers/adding/keyterms/AddingImage.js";

class Adding {
  showingModal(input, sentence, answers) {
    document.querySelector(".modal-body").textContent = "";
    if (!input.value.trim()) new AddingImage(input);
    else new AddingSentence(input, sentence, answers);
  }
}

export default Adding;
