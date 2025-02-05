"use strict";

import { baseUrl } from "../config.js";

export async function sendAPI(typeOfRequest, URL, data = undefined) {
  try {
    let returnedData;
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get("accessLevel");
    const endpointUrl = (URL += URL.includes("?")
      ? `&userName=${userName}`
      : `?userName=${userName}`);
    if (typeOfRequest === "GET") {
      const res = await fetch(endpointUrl, {
        method: "GET",
        credentials: "include",
      });
      returnedData = await res.json();
    } else {
      const fetchObj = {
        method: typeOfRequest,
        headers: {
          "Content-type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      };
      const res = await fetch(endpointUrl, fetchObj);
      returnedData = await res.json();
    }
    return returnedData;
  } catch (err) {
    throw err;
  }
}

export async function uploadImage(baseUrl) {
  const fileInputs = Array.from(
    document.querySelectorAll(".modal-form-control")
  );
  const imageUrls = await Promise.all(
    fileInputs.map(async (fileInput) => {
      console.log(fileInput, fileInput.name);
      const file = fileInput.files[0];
      if (!file) return null;
      const data = await sendAPI(
        "GET",
        `${baseUrl}/get-signed-url?fileName=${file.name}`
      );
      const uploadUrl = data.signedUrl;

      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });
      return { imageUrl: data.imageUrl, name: fileInput.name };
    })
  );
  console.log(imageUrls);
  return imageUrls;
}

export const renderError = function (element, err) {
  const markup = `
  <div>
    Whoops! Something went wrong!
    <br>
    Please refresh the page.
    <br>
    If nothing still works, please contact Tech Support. Please provide him with the following error:
    <br>
    <br>
    <br>
    <div style="color:rgb(100, 10, 0)">
      ${err}
    </div>
    <br>
    <br>
    Tech Support Phone Number: 612-735-0384.
    <br>
    Tech Support Email: shandilya.nookala@gmail.com
  </div>
  `;
  element.innerHTML = markup;
};

export const renderErrorLogin = function (element, err) {
  element.innerHTML = `<p style="color:rgb(100, 10, 0)">${err}</p>`;
};

export async function logoutUser() {
  await sendAPI("POST", `${baseUrl}/user/logout`);
  window.location.href = window.location.origin;
}
