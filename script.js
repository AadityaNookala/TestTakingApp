"use strict";

import { baseUrl } from "../../config.js";
import { renderErrorLogin, sendAPI } from "./helpers/helpers.js";

class App {
  constructor() {
    this.flipCard = document.getElementById("flipCard");
    this.goButton = document.querySelector(".go-button");
    this.loginForm = document.getElementById("loginForm");
    this.spinnerOverlay = document.querySelector(".spinner-overlay");

    this.togglePasswordButton = document.getElementById("togglePassword");
    this.togglePasswordIcon = document.getElementById("togglePasswordIcon");

    this.handleGoHover = this.handleGoHover.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleTogglePassword = this.handleTogglePassword.bind(this);

    this.goButton.addEventListener("mouseenter", this.handleGoHover);
    this.loginForm.addEventListener("submit", this.handleLogin);
    this.togglePasswordButton.addEventListener(
      "click",
      this.handleTogglePassword
    );
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
        renderErrorLogin(
          document.querySelector("#loginForm"),
          response.message
        );
      } else if (response.isAdmin) {
        window.location.href = `/admin/index.html?accessLevel=${userName}`;
      } else {
        window.location.href = `/student/choose-test/index.html?accessLevel=${userName}`;
      }
    } catch (error) {
      this.spinnerOverlay.classList.add("hidden");
      renderErrorLogin(document.querySelector("#loginForm"), error.message);
    }
  }

  handleTogglePassword() {
    const passwordField = document.getElementById("passwordField");
    const type =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);

    if (type === "password") {
      this.togglePasswordIcon.classList.remove("bi-eye-slash");
      this.togglePasswordIcon.classList.add("bi-eye");
    } else {
      this.togglePasswordIcon.classList.remove("bi-eye");
      this.togglePasswordIcon.classList.add("bi-eye-slash");
    }
  }
}

new App();
