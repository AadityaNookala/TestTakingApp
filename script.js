"use strict";
import { baseUrl } from "../../config.js";
import { sendAPI } from "./helpers.js";

class App {
  constructor() {
    this.url = window.location.href.replace("index.html", "");
    this.modalBody = document.querySelector(".modal-body");
    this.showUsers();
    document.addEventListener("click", this.openNewUrl.bind(this));
  }
  async showUsers() {
    const users = (await sendAPI("GET", `${baseUrl}/user`)).data.data;
    users.forEach((element) => {
      this.modalBody.insertAdjacentHTML(
        "beforeend",
        `<a href="student/choose-test/index.html" class="links">${element.userName}</a>`
      );
    });
    this.modalBody.insertAdjacentHTML(
      "beforeend",
      `<a href="admin/index.html" class="links">Admin</a>`
    );
    document.querySelector(".spinner-border").style.display = "none";
  }
  openNewUrl(e) {
    e.preventDefault();
    if (e.target.classList.contains("links")) {
      const realUrl =
        this.url +
        e.target.getAttribute("href") +
        "?" +
        `accessLevel=${e.target.textContent}`;
      window.open(realUrl, "_blank");
    }
  }
}

new App();
