// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
  get,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzwQ7CRDzxgNBSX0RJnxEtGXvGai_45U0",
  authDomain: "contabitas.firebaseapp.com",
  databaseURL:
    "https://contabitas-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "contabitas",
  storageBucket: "contabitas.appspot.com",
  messagingSenderId: "246014622334",
  appId: "1:246014622334:web:c3ac028657dd666c28b62f",
};

let countdown; // Global variable to keep track of the countdown

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to get today's date in YYYY-MM-DD format
function getToday() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

// Function to increase count
function increaseCount() {
  const selectedRadio = document.querySelector('input[name="user"]:checked');
  if (!selectedRadio) {
    console.warn("No user selected.");
    return;
  }
  const user = selectedRadio.value;
  const today = getToday();
  const userRef = ref(database, `counts/${user}/${today}`);

  // Retrieve the current count before updating
  get(userRef).then((snapshot) => {
    const currentData = snapshot.val();
    const currentCount = currentData ? currentData.count : 0;

    // Show the overlay with the current count
    document.getElementById("overlay").style.display = "flex";
    const countDisplay = document.getElementById("count-display");
    countDisplay.textContent = currentCount;
    countDisplay.style.transform = "scale(1)";

    // Update the count in Firebase
    runTransaction(userRef, (data) => {
      if (data) {
        return { count: data.count + 1, lastUpdated: new Date().toISOString() };
      } else {
        return { count: 1, lastUpdated: new Date().toISOString() };
      }
    }).then(() => {
      // Update to the new count and keep the overlay displayed
      const countDisplay = document.getElementById("count-display");
      countDisplay.textContent = currentCount + 1;
      countDisplay.style.transform = "scale(1.5)"; // Enlarge effect
      // Do not hide the overlay, so there is no need for the setTimeout function that hides it
    });
  });
}

// Function to update table with Firebase data and format date
function updateTable() {
  const countsRef = ref(database, "counts");
  onValue(countsRef, (snapshot) => {
    const users = snapshot.val();
    const tableHeader = document.getElementById("table-header");
    const tableBody = document.getElementById("counts-table");

    // Clear previous table rows and headers
    tableBody.innerHTML = "";
    tableHeader.innerHTML = "<th>Date</th>"; // Reset headers with the Date column

    // First, find all unique dates and user IDs
    const dates = new Set();
    Object.values(users).forEach((userDates) => {
      Object.keys(userDates).forEach((date) => {
        dates.add(date);
      });
    });

    // Create headers for users
    Object.keys(users).forEach((user) => {
      const th = document.createElement("th");
      th.textContent = user;
      tableHeader.appendChild(th);
    });

    // Create rows for each date
    dates.forEach((date) => {
      const tr = document.createElement("tr");
      const dateTd = document.createElement("td");
      dateTd.textContent = date;
      tr.appendChild(dateTd);

      // Create a cell for each user on that date
      Object.keys(users).forEach((user) => {
        const td = document.createElement("td");
        const userDate = users[user][date];
        td.textContent = userDate ? userDate.count : "0"; // If there's no count, display '0'
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  });
}

// Add event listeners after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  updateTable();

  // Reference to the button
  const increaseBtn = document.getElementById("increase-btn");

  // Add click event listener to the button
  increaseBtn.addEventListener("click", increaseCount);

  // Get all radio inputs
  const radios = document.querySelectorAll('input[type="radio"]');

  // Add change event listeners to radio inputs to enable the button when a radio is selected
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      increaseBtn.disabled = false; // Enable the button
    });
  });
});
