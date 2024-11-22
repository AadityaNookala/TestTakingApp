"use strict";

import { baseUrl } from "../../config.js";
import { renderError, sendAPI } from "./helpers/helpers.js";

class App {
  constructor() {
    this.flipCard = document.getElementById("flipCard");
    this.goButton = document.querySelector(".go-button");
    this.loginForm = document.getElementById("loginForm");
    this.spinnerOverlay = document.querySelector(".spinner-overlay");

    this.handleGoHover = this.handleGoHover.bind(this);
    this.handleLogin = this.handleLogin.bind(this);

    this.goButton.addEventListener("mouseenter", this.handleGoHover);
    this.loginForm.addEventListener("submit", this.handleLogin);
  }

  handleGoHover() {
    this.flipCard.classList.add("flipped");
    this.goButton.removeEventListener("mouseenter", this.handleGoHover);
  }

  async handleLogin(event) {
    event.preventDefault();

    const userName = document.querySelector(".username-input").value;
    const password = document.querySelector(".password-input").value;
    this.spinnerOverlay.classList.remove("hidden");

    try {
      const response = await sendAPI("POST", `${baseUrl}/user/login`, {
        userName,
        password,
      });

      this.spinnerOverlay.classList.add("hidden");

      if (response.status === "fail") {
        renderError(response.message);
      } else if (response.isAdmin) {
        window.location.href = `/admin/index.html?accessLevel=${userName}`;
      } else {
        window.location.href = `/student/choose-test/index.html?accessLevel=${userName}`;
      }
    } catch (error) {
      this.spinnerOverlay.classList.add("hidden");
      renderError(error.message);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new App());
