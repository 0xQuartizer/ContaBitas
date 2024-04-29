// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzwQ7CRDzxgNBSX0RJnxEtGXvGai_45U0",
    authDomain: "contabitas.firebaseapp.com",
    databaseURL: "https://contabitas-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "contabitas",
    storageBucket: "contabitas.appspot.com",
    messagingSenderId: "246014622334",
    appId: "1:246014622334:web:c3ac028657dd666c28b62f"
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
    const user = document.querySelector('input[name="user"]:checked').value;
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
}

// Function to update table with Firebase data and format date
function updateTable() {
    const countsRef = ref(database, 'counts');
    onValue(countsRef, (snapshot) => {
        const users = snapshot.val();
        const tableBody = document.getElementById('counts-table');
        tableBody.innerHTML = ''; // Clear previous rows
        Object.entries(users).forEach(([user, dates]) => {
            Object.entries(dates).forEach(([date, data]) => {
                const row = `<tr><td>${user}</td><td>${data.count}</td><td>${date}</td><td>${new Date(data.lastUpdated).toLocaleString()}</td></tr>`;
                tableBody.innerHTML += row;
            });
        });
    });
}

// Add event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    updateTable();
    document.getElementById('increase-btn').addEventListener('click', increaseCount);
});
