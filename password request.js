import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import firebaseConfig from './config.js';

console.log("Firebase Config:", firebaseConfig);


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle the form submission
document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const messageDiv = document.getElementById("message");

    // Clear previous messages
    messageDiv.textContent = '';

    if (!email) {
        messageDiv.textContent = "Please enter an email address.";
        messageDiv.style.color = "red";
        return;
    }

    try {
        // Send the password reset email
        await sendPasswordResetEmail(auth, email);
        messageDiv.textContent = "Password reset link sent to " + email;
        messageDiv.style.color = "green";
    } catch (error) {
        messageDiv.textContent = "Error: " + error.message;
        messageDiv.style.color = "red";
    }
});
