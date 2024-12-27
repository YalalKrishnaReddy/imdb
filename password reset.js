import { getAuth, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import firebaseConfig from './config.js';

console.log("Firebase Config:", firebaseConfig);


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get the password reset code from the URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const oobCode = urlParams.get('oobCode');

// Check if the oobCode is valid
if (!oobCode) {
    document.getElementById("message").textContent = "Invalid or expired link.";
}

// Handle form submission for new password
document.getElementById("newPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value.trim();
    const messageDiv = document.getElementById("message");

    // Clear previous messages
    messageDiv.textContent = '';

    if (!newPassword) {
        messageDiv.textContent = "Please enter a new password.";
        messageDiv.style.color = "red";
        return;
    }

    try {
        // Confirm password reset using the oobCode
        await confirmPasswordReset(auth, oobCode, newPassword);
        messageDiv.textContent = "Your password has been successfully reset.";
        messageDiv.style.color = "green";
    } catch (error) {
        messageDiv.textContent = "Error: " + error.message;
        messageDiv.style.color = "red";
    }
});
