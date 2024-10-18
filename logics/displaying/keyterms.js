"use strict";

import { default as Common } from "./common.js";

class Displaying extends Common {
  constructor() {
    super();
    (async () => {
      await this.getRandomTest();
      document.querySelector(".container").insertAdjacentHTML(
        "beforeend",
        `<div class="fixed" draggable="true">

    </div>
    <div class="sentences" draggable="true">

    </div>`
      );
    })();
  }
}

export default Displaying;
