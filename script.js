"use strict";
import { baseUrl } from "../../config.js";
import { renderError, sendAPI } from "./helpers/helpers.js";

class App {
  #loginButton;

  constructor() {
    this.#loginButton = document.querySelector(".login-button");
    this.#loginButton.addEventListener("click", this.#login.bind(this));
  }

  async #login(e) {
    e.preventDefault();
    const userName = document.querySelector(".username-input").value;
    const password = document.querySelector(".password-input").value;
    const spinnerOverlay = document.querySelector(".spinner-overlay");

    spinnerOverlay.classList.remove("hidden");

    try {
      const loggedIn = await sendAPI("POST", `${baseUrl}/user/login`, {
        userName,
        password,
      });

      spinnerOverlay.classList.add("hidden");

      if (loggedIn.status === "fail") {
        renderError(document.body, loggedIn.message);
      } else if (loggedIn.isAdmin) {
        window.open(`/admin/index.html?accessLevel=${userName}`);
      } else {
        window.open(`/student/choose-test/index.html?accessLevel=${userName}`);
      }
    } catch (error) {
      spinnerOverlay.classList.add("hidden");
      renderError(document.body, error.message);
    }
  }
}

new App();
