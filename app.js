// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
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
  if (selectedRadio) {
    // Check if a radio button is selected
    const user = selectedRadio.value;
    const today = getToday();
    const now = new Date().toISOString();
    const userRef = ref(database, `counts/${user}/${today}`);
    runTransaction(userRef, (currentData) => {
      if (currentData) {
        return { count: currentData.count + 1, lastUpdated: now };
      } else {
        return { count: 1, lastUpdated: now };
      }
    });
  } else {
    // Optionally, do something if no radio is selected, like a warning message
    console.warn("No user selected.");
  }
  // After updating the count, change the button text and disable it
  const increaseBtn = document.getElementById("increase-btn");
  increaseBtn.textContent = "Calma leão";
  increaseBtn.disabled = true;

  // Start the countdown timer
  startCountdown(30);
}

function startCountdown(duration) {
  const timerLine = document.getElementById("timer-line");
  let remainingTime = duration;
  const interval = duration * 10; // Calculate the interval for the line as a percentage

  // Show the timer line and initialize its width
  timerLine.style.width = "100%";
  timerLine.style.display = "block";

  const countdown = setInterval(() => {
    remainingTime--;
    timerLine.style.width = `${(remainingTime / duration) * 100}%`; // Update the line width based on time remaining

    if (remainingTime <= 0) {
      clearInterval(countdown);
      document.getElementById("increase-btn").textContent = "Increase Count";
      document.getElementById("increase-btn").disabled = false;
      timerLine.style.display = "none"; // Hide the timer line
    }
  }, 1000); // Update every second
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
