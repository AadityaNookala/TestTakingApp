"use strict";
import { baseUrl, sendAPI } from "../../config.js";
let url = window.location.href;
url = url.replace("index.html", "");
const modalBody = document.querySelector(".modal-body");
const users = (await sendAPI("GET", `${baseUrl}/user`)).data.data;
users.forEach((element) => {
  modalBody.insertAdjacentHTML(
    "beforeend",
    `<a href="student/choose-test/index.html" class="links">${element.userName}</a>`
  );
});
modalBody.insertAdjacentHTML(
  "beforeend",
  `<a href="admin/index.html" class="links">Admin</a>`
);
document.querySelector(".spinner-border").style.display = "none";
document.querySelector(".modal-body").addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.classList.contains("links")) {
    const realUrl =
      url + e.target.getAttribute("href") + "?" + `${e.target.textContent}`;
    window.open(realUrl, "_blank");
  }
});
