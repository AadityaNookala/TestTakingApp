// export const baseUrl =
// "https://us-central1-allprojects-424621.cloudfunctions.net/spellings-function";
// export const baseUrlScheduler =
// "https://us-central1-allprojects-424621.cloudfunctions.net/scheduler-function";
export const baseUrl = "http://127.0.0.1:8000";
export const baseUrlScheduler = "http://127.0.0.1:3000";

export const arrOfPuncs = [
  ",",
  ".",
  "!",
  "?",
  ":",
  ";",
  "“",
  "”",
  '"',
  "(",
  ")",
  "‘",
  "`",
  "’",
];
export async function sendAPI(typeOfRequest, URL, data = undefined) {
  try {
    let returnedData;
    if (typeOfRequest === "GET") {
      const res = await fetch(URL);
      returnedData = await res.json();
    } else {
      const res = await fetch(URL, {
        method: typeOfRequest,
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      returnedData = await res.json();
    }
    return returnedData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
