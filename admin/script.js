"use strict";

import { baseUrl } from "../config.js";
import { logoutUser, sendAPI } from "../helpers/helpers.js";
import Sortable from "../sortablejs/modular/sortable.core.esm.js";
class App {
  constructor() {
    (async () => {
      this.testCategories = (
        await sendAPI("GET", `${baseUrl}/categories`)
      ).data.data.sort((p1, p2) =>
        p1.categoryName > p2.categoryName
          ? 1
          : p1.categoryName < p2.categoryName
          ? -1
          : 0
      );
      this.addNewTestsCategory = document.querySelector(
        ".add-new-test-category"
      );
      this.spellingsCategoriesContainer = document.querySelector(
        ".categories-container"
      );
      this.sentenceCombiningCategoriesContainer = document.querySelector(
        ".sentence-combining-categories-container"
      );
      this.keyTermsCategoriesContainer = document.querySelector(
        ".key-terms-categories-container"
      );
      this.logout = document.querySelector(".logout-button");
      this.addNewUsers = document.querySelector(".add-new-user");
      this.usersContainer = document.querySelector(".users-container");
      this.scores = document.querySelector(".scores");
      this.addSpinner();
      this.createSortable();
      await this.showCategories();
      await this.showUsers();
      await this.showUsersInScores();
      this.createSortableForEachCategory();
      this.initializeTestSortables();
      document.addEventListener("click", this.clickShowButton.bind(this));
      this.addNewUsers.addEventListener("click", this.addNewUser.bind(this));
      document
        .querySelector(".categories")
        .addEventListener(
          "click",
          this.handleClickOnCategoriesContainer.bind(this)
        );
      this.logout.addEventListener("click", logoutUser.bind(this));
      this.addNewTestsCategory.addEventListener.onClick =
        this.handleClickOnCategoriesContainer.bind(this);
      this.scores.addEventListener("click", this.handleClickOnScore.bind(this));
      this.spellingsCategoriesContainer.addEventListener(
        "click",
        this.editTestName.bind(this)
      );
      this.sentenceCombiningCategoriesContainer.addEventListener(
        "click",
        this.editTestName.bind(this)
      );
      this.keyTermsCategoriesContainer.addEventListener(
        "click",
        this.editTestName.bind(this)
      );
      this.spellingsCategoriesContainer.addEventListener(
        "click",
        this.clone.bind(this)
      );
      this.spellingsCategoriesContainer.addEventListener(
        "click",
        this.copyTestName.bind(this)
      );
      this.spellingsCategoriesContainer.addEventListener(
        "click",
        this.copyCategoryName.bind(this)
      );
      this.sentenceCombiningCategoriesContainer.addEventListener(
        "click",
        this.copyTestName.bind(this)
      );
      this.sentenceCombiningCategoriesContainer.addEventListener(
        "click",
        this.copyCategoryName.bind(this)
      );
      this.keyTermsCategoriesContainer.addEventListener(
        "click",
        this.copyTestName.bind(this)
      );
      this.keyTermsCategoriesContainer.addEventListener(
        "click",
        this.copyCategoryName.bind(this)
      );
    })();
  }
  addSpinner() {
    document.querySelector(".spinner").insertAdjacentHTML(
      "beforeend",
      `<div class="spinner-border text-info" role="status">
    <span class="visually-hidden">Loading...</span>
    </div>`
    );
  }

  createSortable() {
    Sortable.create(this.spellingsCategoriesContainer, {
      group: {
        name: "shared",
        pull: "clone",
        put: false,
      },
      animation: 500,
      sort: false,
    });
    Sortable.create(this.sentenceCombiningCategoriesContainer, {
      group: {
        name: "shared",
        pull: "clone",
        put: false,
      },
      animation: 500,
      sort: false,
    });
    Sortable.create(this.keyTermsCategoriesContainer, {
      group: {
        name: "shared",
        pull: "clone",
        put: false,
      },
      animation: 500,
      sort: false,
    });
  }

  initializeTestSortables() {
    const testContainers = document.querySelectorAll(".tests-container");
    testContainers.forEach((container) => {
      if (!container.dataset.sortableInitialized) {
        Sortable.create(container, {
          group: {
            name: "tests",
            pull: false,
            put: false,
          },
          animation: 150,
          sort: true,
          preventOnFilter: false,
          onMove: (e) => {
            if (
              e.related.classList.contains("heading-row") ||
              e.dragged.classList.contains("heading-row")
            ) {
              return false;
            }
          },
          onEnd: async (e) => {
            const allTestsNodes = e.from.querySelectorAll(".test:not(.header)");
            const allTests = [];
            allTestsNodes.forEach((el) => allTests.push(el.textContent.trim()));
            const category = (
              await sendAPI(
                "PATCH",
                `${baseUrl}/categories/updateTests/${
                  e.from.closest(".test-categories-showing").dataset
                    .categoryName
                }`,
                { allTests }
              )
            ).newCategory;
            const html = this.#updateTest(category);
            e.from.innerHTML = html;
          },
        });
        container.dataset.sortableInitialized = true;
      }
    });
  }

  async addNewUser() {
    this.addNewUsers
      .closest(".users")
      .querySelector(".users-container")
      .classList.remove("hidden");
    this.addNewUsers
      .closest(".users-showing")
      .querySelector(".show-button").textContent = "-";
    this.usersContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="user"><div class="categories-showing mt-4">
      <button class="show-button">+</button>
      <h2 class="test-categories user-name"><input type="text" class="user-input username" placeholder="Username"><input type="password" class="user-input password" placeholder="Password"></h2>
    </div>
    <div class="categories-container-users child hidden">
        </div>
    </div>
    <button class="add-user-button mt-2">Add User</button>
    `
    );
    const userName = document.querySelector(".username");
    const password = document.querySelector(".password");
    userName.focus();
    const addUserButton = document.querySelector(".add-user-button");
    addUserButton.addEventListener("click", async function () {
      await sendAPI("POST", `${baseUrl}/user`, {
        userName: userName.value.trim(),
        password: password.value.trim(),
      });
      userName.closest(".test-categories").innerHTML = userName.value;
      password.remove();
      addUserButton.remove();
    });
  }
  clickShowButton(e) {
    const showButton = e.target.closest(".show-button");
    if (!showButton) return;
    showButton.parentElement.parentElement
      .querySelector(".child")
      .classList.toggle("hidden");
    if (showButton.textContent === "+") {
      showButton.textContent = "-";
    } else {
      showButton.textContent = "+";
    }
  }
  async handleClickOnCategoriesContainer(e) {
    const addNewTestButton = e.target.closest(".add-new-test-tests");
    const addNewTestCategoryButton = e.target.closest(".add-new-test-category");
    const row = e.target.closest(".row");
    const edit = e.target.closest(".edit");
    const editTestCategory = e.target.closest(".button-edit-category");
    const copy = e.target.closest(".copy");
    if (
      !addNewTestButton &&
      !row &&
      !editTestCategory &&
      !addNewTestCategoryButton
    )
      return;
    if (editTestCategory) {
      const buttonsWrapper = editTestCategory.closest(".buttons-wrapper");
      const testCategoriesHeading =
        buttonsWrapper.querySelector(".test-categories");
      const oldTestCategoryName = testCategoriesHeading.textContent.trim();
      testCategoriesHeading.innerHTML = `<input type="text" class="input" value="${oldTestCategoryName}">`;
      buttonsWrapper.insertAdjacentHTML(
        "beforeend",
        '<button class="button-edit" fdprocessedid="ymg9sp">Edit Category Name</button><button class="button-cancel" fdprocessedid="ymg9sp">Cancel</button>'
      );
      const editCategoryName = document.querySelector(".button-edit");
      const cancel = document.querySelector(".button-cancel");
      cancel.addEventListener("click", function () {
        testCategoriesHeading.innerHTML = oldTestCategoryName;
        editCategoryName.remove();
        cancel.remove();
      });
      editCategoryName.addEventListener("click", async function () {
        const newTestCategoryName = testCategoriesHeading
          .querySelector("input")
          .value.trim();
        testCategoriesHeading.innerHTML = newTestCategoryName;
        editCategoryName.remove();
        cancel.remove();
        buttonsWrapper.closest(
          ".test-categories-showing"
        ).dataset.categoryName = newTestCategoryName;
        const userData = (await sendAPI("GET", `${baseUrl}/user`)).data.data;
        userData.forEach((el) => {
          if (el.testCategories.includes(oldTestCategoryName)) {
            document.querySelectorAll(".user").forEach((el) => {
              el.querySelectorAll(".test-categories-showing").forEach((el) => {
                if (el.dataset.categoryName === oldTestCategoryName) {
                  el.dataset.categoryName = newTestCategoryName;
                  el.querySelector(".test-categories").textContent =
                    newTestCategoryName;
                }
              });
            });
          }
        });
        await sendAPI("PATCH", `${baseUrl}/update/${oldTestCategoryName}`, {
          testCategory: newTestCategoryName,
        });
      });
    }
    if (row) {
      if (edit || row.querySelector(".edit-input") || copy) return;
    }
    if (
      row &&
      !row.classList.contains("heading-row") &&
      !row.querySelector(".test-input")
    ) {
      const testName = row.querySelector(".test").textContent;
      const categoryName = row.closest(".test-categories-showing").dataset
        .categoryName;
      let url = window.location.href;
      const urlSplit = url.split("?");
      urlSplit[1] += `&testCategory=${categoryName.trim()}&testName=${testName.trim()}&dataType=${
        row.closest(".category").dataset.type
      }`;
      const urlSplitSplit = urlSplit[0].split("/");
      urlSplitSplit[urlSplitSplit.indexOf("admin")] += "/add-word-and-sentence";
      urlSplit[0] = urlSplitSplit.join("/");
      url = urlSplit.join("?");
      window.open(url, "__blank");
    } else if (addNewTestButton) {
      const allTestCategories = (await sendAPI("GET", `${baseUrl}/categories`))
        .data.data;
      addNewTestButton
        .closest(".test-categories-showing")
        .querySelector(".tests-container")
        .classList.remove("hidden");
      addNewTestButton
        .closest(".buttons-wrapper")
        .querySelector(".show-button").textContent = "-";
      const parentElement = e.target.closest(".test-categories-showing");
      const nextElement = parentElement.querySelector(".tests-container");
      nextElement.classList.remove("hidden");
      parentElement.querySelector(".show-button").textContent = "-";
      const foundObject = allTestCategories.find(
        (testCategory) =>
          testCategory.categoryName === parentElement.dataset.categoryName
      );
      nextElement.insertAdjacentHTML(
        "beforeend",
        `<div class="row">
      <div class="number">
        ${foundObject.tests.length + 1}
      </div>
      <div class="test">
      <input type="text" class="test-input">
      </div>
      <div class="edit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
          </path>
        </svg>
      </div>
      <div class="copy">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
  </svg>
  </div>
    </div>
    <button class="add-test-button mt-2">Add Test</button>
    
  <br>`
      );
      nextElement.querySelector(".test-input").focus();
      const button = document.querySelector(".add-test-button");
      button.addEventListener("click", async function () {
        const testInput = document.querySelector(".test-input");
        const value = testInput.value.trim();
        let flag = false;
        let category;
        allTestCategories.forEach((el) => {
          let flag2 = false;
          for (let i = 0; i < el.tests.length; i++) {
            if (el.tests[i].toLowerCase() === value.toLowerCase()) {
              flag2 = true;
              category = el.categoryName;
            }
          }
          if (flag2 && !flag) {
            flag = true;
          }
        });
        if (flag) {
          button
            .closest(".tests-container")
            .insertAdjacentHTML(
              "beforeend",
              `<div class="text">The test: "${value}" already exists in the test category: ${category}</div>`
            );
        } else if (testInput.value.includes("?")) {
          button
            .closest(".tests-container")
            .insertAdjacentHTML(
              "beforeend",
              `<div class="text">The test: "${value}" includes a "?"</div>`
            );
        } else {
          const tests = testInput.closest(".test");
          const testCategoryName = e.target.closest(".test-categories-showing")
            .dataset.categoryName;
          foundObject.tests.push(value);
          const resArray = [];
          resArray.push(
            sendAPI("PATCH", `${baseUrl}/categories/${testCategoryName}`, {
              tests: foundObject.tests,
            })
          );
          resArray.push(
            sendAPI("POST", `${baseUrl}/test/${testCategoryName}`, {
              testName: value,
            })
          );
          await Promise.all(resArray);
          tests.innerHTML = value;
          button.remove();
          userData.every((element) => {
            if (element.allTestCategories.includes(testCategoryName)) {
              this.usersContainer
                .querySelectorAll(".user-name")
                .forEach((userName) => {
                  userName
                    .closest(".user")
                    .querySelector(".categories-container-users")
                    .querySelectorAll(".test-categories-showing")
                    .forEach((element2) => {
                      if (element2.dataset.categoryName === testCategoryName) {
                        element2
                          .querySelector(".tests-container")
                          .insertAdjacentHTML(
                            "beforeend",
                            `<div class="row">
                  <div class="number">
                    ${foundObject.tests.length}
                  </div>
                  <div class="test">
                  ${value}
                  </div>
                  
                </div>`
                          );
                        flag = 1;
                      }
                    });
                });
            }
            if (flag) {
              return;
            }
          });
        }
      });
    } else if (addNewTestCategoryButton) {
      let type;
      if (e.target.closest(".category").dataset.type === "spellings") {
        this.spellingsCategoriesContainer.classList.remove("hidden");
        this.spellingsCategoriesContainer.previousElementSibling.querySelector(
          ".show-button"
        ).textContent = "-";
        this.spellingsCategoriesContainer.insertAdjacentHTML(
          "beforeend",
          `<div class="categories-showing mt-4">
        <a class="show-button">+</a>
        <h2 class="test-categories"><input type="text" class="input"></h2>
      </div>
      <input type="checkbox" id="meanings-input" name="meanings" value="meanings">
      <label for="meanings" class="meanings">Do you want meanings for this test category</label>
      <button class="button-add">Add Category</button>`
        );
        const buttonAdd = document.querySelector(".button-add");
        buttonAdd.addEventListener("click", async () => {
          const checkBox = document.querySelector("#meanings-input");
          let checked = false;
          if (checkBox.checked) {
            checked = true;
          }
          const inputValue = document.querySelector(".input").value;
          const object = {
            categoryName: inputValue,
            tests: [],
            withMeanings: checked,
            isClone: false,
            type: "spellings",
          };
          await sendAPI("POST", `${baseUrl}/categories`, object);

          this.testCategories.push(object);
          this.showCategories();
        });
      }
      if (e.target.closest(".category").dataset.type === "sentence-combining") {
        this.sentenceCombiningCategoriesContainer.classList.remove("hidden");
        this.sentenceCombiningCategoriesContainer.previousElementSibling.querySelector(
          ".show-button"
        ).textContent = "-";
        this.sentenceCombiningCategoriesContainer.insertAdjacentHTML(
          "beforeend",
          `<div class="categories-showing mt-4">
          <a class="show-button">+</a>
          <h2 class="test-categories"><input type="text" class="input"></h2>
        </div>
        <button class="button-add">Add Category</button>`
        );
        type = "sentence-combining";
      } else if (e.target.closest(".category").dataset.type === "key-terms") {
        this.keyTermsCategoriesContainer.classList.remove("hidden");
        this.keyTermsCategoriesContainer.previousElementSibling.querySelector(
          ".show-button"
        ).textContent = "-";
        this.keyTermsCategoriesContainer.insertAdjacentHTML(
          "beforeend",
          `<div class="categories-showing mt-4">
        <a class="show-button">+</a>
        <h2 class="test-categories"><input type="text" class="input"></h2>
      </div>
      <button class="button-add">Add Category</button>`
        );
        type = "key-terms";
      }
      const buttonAdd = document.querySelector(".button-add");
      buttonAdd.addEventListener("click", async () => {
        const inputValue = document.querySelector(".input").value;
        const object = {
          categoryName: inputValue,
          tests: [],
          isClone: false,
          type,
        };
        await sendAPI("POST", `${baseUrl}/categories`, object);
        this.testCategories.push(object);
        this.showCategories();
      });
    }
  }

  async showCategories() {
    this.testCategories = (
      await sendAPI("GET", `${baseUrl}/categories`)
    ).data.data.sort((p1, p2) =>
      p1.categoryName > p2.categoryName
        ? 1
        : p1.categoryName < p2.categoryName
        ? -1
        : 0
    );

    this.spellingsCategoriesContainer.innerHTML = "";
    this.sentenceCombiningCategoriesContainer.innerHTML = "";
    this.keyTermsCategoriesContainer.innerHTML = "";
    this.testCategories.forEach((element) => {
      let html = ``;
      html += `<div class="test-categories-showing mt-4" data-category-name="${
        element.categoryName
      }">
      <div class="buttons-wrapper">
      <a class="show-button">+</a>
      <h2 class="test-categories">${element.categoryName}</h2>
      <button class="button-edit-category">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
      class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
      </path>
    </svg>
      </button>  
      ${
        element.isClone
          ? ""
          : `<a class="add-new-test-tests">Add new Test</a>
        
      `
      }
      ${
        element.isClone ||
        element.type === "sentence-combining" ||
        element.type === "key-terms"
          ? ""
          : `<button class="clone-button">Clone</button>`
      }
      <button class="copy-category-name">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
  </svg>
  </button>
      </div>`;
      html += `
      <div class="mt-3 container hidden tests-container child">
    <div class="row heading-row">
      <div class="number header">
        #
      </div>
      <div class="test header">
        Test
      </div>
      ${
        element.isClone
          ? ""
          : `<div class="edit header">
      Edit
    </div>`
      }
      <div class="copy header">
        Copy
      </div>
    </div>
    `;
      element.tests.forEach((e, i) => {
        html += `
        <div class="row">
          <div class="number">
            ${i + 1}
          </div>
          <div class="test">
            ${e}
          </div>
          ${
            element.isClone
              ? ""
              : `<div class="edit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
            </path>
          </svg>
        </div>`
          }
          <div class="copy">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
  </svg>
  </div>
        </div>`;
      });
      html += "</div></div>";
      if (element.type === "spellings") {
        this.spellingsCategoriesContainer.insertAdjacentHTML("beforeend", html);
      } else if (element.type === "sentence-combining") {
        this.sentenceCombiningCategoriesContainer.insertAdjacentHTML(
          "beforeend",
          html
        );
      } else if (element.type === "key-terms") {
        this.keyTermsCategoriesContainer.insertAdjacentHTML("beforeend", html);
      }
    });
  }

  #updateTest(category) {
    let html = ``;
    html += `
    <div class="row heading-row">
      <div class="number header">
        #
      </div>
      <div class="test header">
        Test
      </div>
      ${
        category.isClone
          ? ""
          : `<div class="edit header">
      Edit
    </div>`
      }
      <div class="copy header">
        Copy
      </div>
    </div>
    `;
    category.tests.forEach((e, i) => {
      html += `
        <div class="row">
          <div class="number">
            ${i + 1}
          </div>
          <div class="test">
            ${e}
          </div>
          ${
            category.isClone
              ? ""
              : `<div class="edit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10">
            </path>
          </svg>
        </div>`
          }
          <div class="copy">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
  </svg>
  </div>
        </div>`;
    });
    return html;
  }

  async showUsers() {
    const testCategories = (
      await sendAPI("GET", `${baseUrl}/categories`)
    ).data.data.sort((p1, p2) =>
      p1.categoryName > p2.categoryName
        ? 1
        : p1.categoryName < p2.categoryName
        ? -1
        : 0
    );
    const userData = (await sendAPI("GET", `${baseUrl}/user`)).data.data;
    userData.forEach((element) => {
      if (element.role !== "admin") {
        let string = ``;
        this.usersContainer.insertAdjacentHTML(
          "beforeend",
          `<div class="user mt-4">
      <div class="user-categories">
      <a class="show-button">+</a>
      <h2 class="test-categories user-name">${element.userName}</h2>
      </div>
      <div class="categories-container-users child hidden">
      </div>
    </div>`
        );
        const user = this.usersContainer.lastElementChild;
        const categoriesContainerUsers = user.querySelector(
          ".categories-container-users"
        );
        element.testCategories.forEach((testCategory) => {
          const object = testCategories.find(
            (elements) => elements.categoryName === testCategory
          );
          let string2 = ``;
          object.tests.forEach((test, i) => {
            string2 += `<div class="row">
          <div class="number">
            ${i + 1}
          </div>
          <div class="test">
            ${test}
          </div>
        </div>`;
          });
          string += `<div class="test-categories-showing mt-4" data-category-name="${testCategory}">
        <div class="buttons-wrapper">
        <a class="show-button">+</a>
        <h2 class="test-categories">${testCategory}</h2>
        </div>
        <div class="mt-3 container hidden tests-container child">
        <div class="row heading-row">
      <div class="number header">
        #
      </div>
      <div class="test header">
        Test
      </div>
    </div>
    ${string2}
      </div>`;
          categoriesContainerUsers.insertAdjacentHTML("beforeend", string);
          string = ``;
        });
      }
    });
  }
  async showUsersInScores() {
    const userData = (await sendAPI("GET", `${baseUrl}/user`)).data.data;
    const score = document.querySelector(".score");
    userData.forEach((element) => {
      score.insertAdjacentHTML(
        "beforeend",
        `<a class="score-score mt-2 user">${element.userName}</a><br><br>`
      );
    });
    document.querySelector(".spinner-border").style.display = "none";
    document.querySelector(".body").classList.remove("hidden");
  }
  createSortableForEachCategory() {
    const categoriesContainerUsers = document.querySelectorAll(
      ".categories-container-users"
    );
    categoriesContainerUsers.forEach((element) => {
      Sortable.create(element, {
        group: "shared",
        animation: 500,
        sort: false,
        async onAdd(e) {
          if (e.item.querySelector(".add-new-test-tests")) {
            e.item.querySelector(".add-new-test-tests").remove();
          }
          if (e.item.querySelector(".clone-button")) {
            e.item.querySelector(".clone-button").remove();
          }
          e.item.querySelector(".button-edit-category").remove();
          e.item.querySelector(".copy-category-name").remove();
          e.item.querySelectorAll(".row").forEach((element, i) => {
            if (element.querySelector(".edit")) {
              element.querySelector(".edit").remove();
            }
          });
          e.item.querySelectorAll(".row").forEach((element, i) => {
            element.querySelector(".copy").remove();
          });
          const categoryName = e.item.dataset.categoryName;
          const userName = e.to
            .closest(".user")
            .querySelector(".test-categories").textContent;
          const userData = (await sendAPI("GET", `${baseUrl}/user`)).data.data;
          const object = userData.find(
            (element) => element.userName === userName
          );
          object.testCategories.push(categoryName);
          await sendAPI(
            "PATCH",
            `${baseUrl}/user/${userName}`,
            object.testCategories
          );
        },
      });
    });
  }
  handleClickOnScore(e) {
    e.preventDefault();
    const url = window.location.href;
    const userButton = e.target.closest(".score-score");
    if (!userButton) return;
    let queryString;
    queryString = url.split("?")[1] += `+${userButton.textContent.trim()}`;
    const urlWithoutQuery = url.split("?")[0].split("/");
    urlWithoutQuery[urlWithoutQuery.indexOf("admin")] += "/scores";
    const realUrl = urlWithoutQuery.join("/") + "?" + queryString;
    window.open(realUrl, "__blank");
  }
  editTestName(e) {
    if (!e.target.closest(".edit")) return;
    this.usersContainer = document.querySelector(".users-container");
    const test = e.target.closest(".row").querySelector(".test");
    const testNumber = e.target
      .closest(".row")
      .querySelector(".number")
      .textContent.trim();
    const testName = test.textContent.trim();
    const testCategoryName = test.closest(".test-categories-showing").dataset
      .categoryName;
    test.innerHTML = `<input class="edit-input" value="${testName}">`;
    const editInput = document.querySelector(".edit-input");
    editInput.focus();
    const row = test.closest(".row");
    row.insertAdjacentHTML(
      "beforeend",
      `<button class="edit-test">Edit</button><button class="cancel">Cancel</button>`
    );

    const editTest = document.querySelector(".edit-test");
    const cancel = document.querySelector(".cancel");
    cancel.addEventListener("click", function () {
      test.innerHTML = testName;
      editTest.remove();
      cancel.remove();
    });
    editTest.addEventListener("click", async function (e) {
      const newTestName = editInput.value.trim();
      const categoryName = e.target.closest(".test-categories-showing").dataset
        .categoryName;
      test.innerHTML = newTestName;
      editTest.remove();
      cancel.remove();
      const userData = (await sendAPI("GET", `${baseUrl}/user`)).data.data;
      let flag = 0;
      userData.every((element) => {
        if (element.testCategories.includes(testCategoryName)) {
          document
            .querySelector(".users-container")
            .querySelectorAll(".user-name")
            .forEach((userName) => {
              userName
                .closest(".user")
                .querySelector(".categories-container-users")
                .querySelectorAll(".test-categories-showing")
                .forEach((element2) => {
                  if (element2.dataset.categoryName === testCategoryName) {
                    element2
                      .querySelector(".tests-container")
                      .querySelectorAll(".row")
                      .forEach((el) => {
                        if (!el.classList.contains("heading-row")) {
                          if (
                            el.querySelector(".number").textContent.trim() ===
                            testNumber
                          ) {
                            el.querySelector(".test").innerHTML = newTestName;
                            return;
                          }
                        }
                      });
                    flag = 1;
                  }
                });
            });
        }
        if (flag) {
          return;
        }
      });
      await sendAPI("PATCH", `${baseUrl}/update/${testName}/${categoryName}`, {
        testName: newTestName,
      });
    });
  }
  async clone(e) {
    const cloneButton = e.target.closest(".clone-button");
    if (!cloneButton) return;
    const withMeanings = (
      await sendAPI(
        "GET",
        `${baseUrl}/categories/clone/${
          cloneButton.closest(".test-categories-showing").dataset.categoryName
        }`
      )
    ).data.withMeanings;
    this.spellingsCategoriesContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="categories-showing mt-4">
    <a class="show-button">+</a>
    <h2 class="test-categories"><input type="text" class="input-category-name" fdprocessedid="6lsswm"></h2>
  </div><input type="checkbox" id="meanings-input" name="meanings" value="meanings"><label for="meanings" class="meanings">${
    withMeanings
      ? "There are meanings from the test category that you are cloning. Do you want to exclude them?"
      : "There are no meanings from the test category that you are cloning. Do you want to include them?"
  }</label><button class="button-add" fdprocessedid="o4koq7">Add Category</button><input type="text" placeholder="What is to be add to all tests" class="input" fdprocessedid="6lsswm">`
    );
    const addCategoryButton = document.querySelector(".button-add");
    addCategoryButton.addEventListener(
      "click",
      async function () {
        let checked = false;
        if (
          (withMeanings &&
            !document.querySelector("#meanings-input").checked) ||
          (!withMeanings && document.querySelector("#meanings-input").checked)
        ) {
          checked = true;
        }
        await sendAPI(
          "POST",
          `${baseUrl}/update/clone/updateTestCategory/${
            cloneButton.closest(".test-categories-showing").dataset.categoryName
          }`,
          {
            categoryName: document
              .querySelector(".input-category-name")
              .value.trim(),
            tests: document.querySelector(".input").value.trim(),
            withMeanings: checked,
            isClone: true,
          }
        );
        await this.showCategories();
      }.bind(this)
    );
  }
  copyTestName(e) {
    const copy = e.target.closest(".copy");
    if (!copy) return;
    navigator.clipboard.writeText(
      copy.closest(".row").querySelector(".test").textContent.trim()
    );
  }
  copyCategoryName(e) {
    const copy = e.target.closest(".copy-category-name");
    if (!copy) return;
    navigator.clipboard.writeText(
      copy
        .closest(".buttons-wrapper")
        .querySelector(".test-categories")
        .textContent.trim()
    );
  }
}

new App();
