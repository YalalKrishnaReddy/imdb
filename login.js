import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import firebaseConfig from './config.js';

console.log("Firebase Config:", firebaseConfig);


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Form submission handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = ""; // Clear any previous error message

  // Check if email and password are empty
  if (!email || !password) {
    errorMessage.textContent = "Please fill out both fields.";
    return;
  }

  try {
    // Try to sign in with Firebase Authentication
    await signInWithEmailAndPassword(auth, email, password);
    
    // Redirect the user to the main page (without alert)
    window.location.href = "index.html";
  } catch (error) {
    // Show custom error message instead of Firebase error code
    let message = "Login failed.";

    // Match the error code to show a custom message
    switch (error.code) {
      case "auth/user-not-found":
        message = "No user found with this email.";
        break;
      case "auth/wrong-password":
        message = "Incorrect password.";
        break;
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please try again later.";
        break;
      default:
        message = "An error occurred. Please try again.";
    }

    // Display the custom error message
    errorMessage.textContent = message;
  }
});
