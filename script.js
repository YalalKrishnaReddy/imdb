import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Firebase Configuration
import firebaseConfig from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const movieContainer = document.getElementById("movieCardContainer");
const loadMoreButton = document.getElementById("loadMore");
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("submit");
const loginLink = document.getElementById("login-link");
const signupLink = document.getElementById("signup-link");
const favoritesLink = document.getElementById("favorites-link");
const logoutBtnContainer = document.getElementById("logout-btn-container");
const confirmLogout = document.getElementById("confirmLogout");
const loadingLine = document.getElementById("loadingLine");
const pageTitle = document.getElementById("page-title");

let allMovies = [];
let favorites = [];
let currentIndex = 0;

// Utility: Fetch favorites from localStorage
function getFavoritesFromLocalStorage(userId) {
  const favorites = localStorage.getItem(`favorites_${userId}`);
  return favorites ? JSON.parse(favorites) : [];
}

// Utility: Save favorites to localStorage
function saveFavoritesToLocalStorage(userId, favorites) {
  localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
}

// Fetch and display movies
async function fetchMovies() {
  try {
    const response = await fetch(`https://rahulcell.github.io/FilmScope-Co/db.json`);
    allMovies = await response.json();
    displayMovies(); // Display the initial set of movies
  } catch (error) {
    console.error("Failed to fetch movies:", error);
  }
}

// Display movies
function displayMovies() {
  const moviesToShow = allMovies.slice(currentIndex, currentIndex + 10);

  if (moviesToShow.length === 0) {
    console.log("No more movies to display.");
    return;
  }

  moviesToShow.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}" class="movie-thumbnail">
      <h2>${movie.title}</h2>
      <button class="bookmark-btn" data-movie-id="${movie.id}" title="Add to Favorites">
        <i class="bi ${favorites.includes(movie.id) ? "bi-bookmark-fill" : "bi-bookmark"}"></i>
      </button>
    `;

    // Add event listener for modal opening
    movieCard
      .querySelector(".movie-thumbnail")
      .addEventListener("click", () => openMovieDetail(movie));

    // Add bookmark event listener
    movieCard
      .querySelector(".bookmark-btn")
      .addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering modal
        toggleFavorite(movie.id);
      });

    movieContainer.appendChild(movieCard);
  });

  currentIndex += 10; // Update index for the next batch
  console.log("Updated currentIndex:", currentIndex);

  // Manage Load More button visibility
  if (currentIndex >= allMovies.length) {
    loadMoreButton.style.display = "none";
  } else {
    loadMoreButton.style.display = "block";
  }
}

// Function to open movie detail modal
function openMovieDetail(movie) {
  const modalContent = document.getElementById("movieDetailContent");
  const imdbLink = document.getElementById("movieImdbLink");

  // Populate modal with movie details
  modalContent.innerHTML = `
    <div class="row">
      <div class="col-md-4">
        <img src="${movie.big_image || movie.image}" alt="${movie.title}" class="img-fluid rounded">
      </div>
      <div class="col-md-8">
        <h3>${movie.title}</h3>
        <p><strong>Year:</strong> ${movie.year}</p>
        <p><strong>Genre:</strong> ${movie.genre.join(", ")}</p>
        <p><strong>Description:</strong> ${movie.description}</p>
        <p><strong>Rating:</strong> ${movie.rating}</p>
      </div>
    </div>
  `;

  // Set IMDb link
  imdbLink.href = movie.imdb_link || `https://www.imdb.com/title/${movie.imdbid}`;

  // Show the modal
  const movieDetailModal = new bootstrap.Modal(
    document.getElementById("movieDetailModal")
  );
  movieDetailModal.show();
}

// Bookmark toggle logic
function toggleFavorite(movieId) {
  const user = auth.currentUser;

  if (!user) {
    alert("Please log in to bookmark movies.");
    return;
  }

  const userId = user.uid;

  if (favorites.includes(movieId)) {
    favorites = favorites.filter((id) => id !== movieId); // Remove from favorites
  } else {
    favorites.push(movieId); // Add to favorites
  }

  saveFavoritesToLocalStorage(userId, favorites); // Save updated favorites
  renderFavorites();
}

function renderFavorites() {
  document.querySelectorAll(".movie-card").forEach((card) => {
    const movieId = card.querySelector(".bookmark-btn").dataset.movieId;
    const icon = card.querySelector(".bookmark-btn i");

    if (favorites.includes(movieId)) {
      icon.classList.remove("bi-bookmark");
      icon.classList.add("bi-bookmark-fill");
    } else {
      icon.classList.remove("bi-bookmark-fill");
      icon.classList.add("bi-bookmark");
    }
  });
}

// Clear movie container
function clearMovieContainer() {
  movieContainer.innerHTML = "";
}

// Authentication state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginLink.style.display = "none";
    signupLink.style.display = "none";
    favoritesLink.style.display = "block";
    logoutBtnContainer.style.display = "block";

    const userId = user.uid;
    favorites = getFavoritesFromLocalStorage(userId); // Load favorites
    renderFavorites();
  } else {
    loginLink.style.display = "block";
    signupLink.style.display = "block";
    favoritesLink.style.display = "none";
    logoutBtnContainer.style.display = "none";

    favorites = [];
    renderFavorites();
  }
});

// Animate loading line
function animateLoadingLine(callback) {
  loadingLine.style.width = "0%";

  setTimeout(() => {
    loadingLine.style.width = "100%";

    setTimeout(() => {
      loadingLine.style.width = "0%";
      if (callback) callback();
    }, 500);
  }, 50);
}

// Handle Favorites Click Event
favoritesLink.addEventListener("click", () => {
  animateLoadingLine(() => {
    pageTitle.innerText = "My Favorites";
    clearMovieContainer();

    favorites.forEach((favoriteId) => {
      const favoriteMovie = allMovies.find((movie) => movie.id === favoriteId);
      if (favoriteMovie) {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";
        movieCard.innerHTML = `
          <img src="${favoriteMovie.image}" alt="${favoriteMovie.title}">
          <h2>${favoriteMovie.title}</h2>
          <button class="bookmark-btn" data-movie-id="${favoriteMovie.id}" title="Remove from Favorites">
            <i class="bi bi-bookmark-fill"></i>
          </button>
        `;
        movieCard
          .querySelector(".bookmark-btn")
          .addEventListener("click", () => toggleFavorite(favoriteMovie.id));
        movieContainer.appendChild(movieCard);
      }
    });

    document.getElementById("loadMoreContainer").style.display = "none";
  });
});

// Logout button
confirmLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("You have successfully logged out.");
    window.location.href = "./index.html"
  } catch (error) {
    console.error("Error signing out:", error);
  }
});

// Search movies
searchButton.addEventListener("click", async (event) => {
  event.preventDefault();

  pageTitle.style.display = "none";
  loadMoreButton.style.display = "none";

  const query = searchInput.value.trim();
  if (query) {
    await searchMovies(query);
  }
});

// Function to search for movies
async function searchMovies(query) {
  movieContainer.innerHTML = "";
  try {
    const url = `https://www.omdbapi.com/?apikey=231a6a00&s=${query}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      allMovies = data.Search.map((movie) => ({
        id: movie.imdbID,
        title: movie.Title,
        image: movie.Poster,
        year: movie.Year,
        genre: movie.Genre ? movie.Genre.split(", ") : ["N/A"],
        description: movie.Plot,
        rating: movie.imdbRating,
        imdbid: movie.imdbID,
        imdb_link: `https://www.imdb.com/title/${movie.imdbID}`,
      }));
      currentIndex = 0;
      displayMovies();
    } else {
      console.log("No movies found for the given search term.");
    }
  } catch (error) {
    console.error("Error searching movies:", error);
  }
}

// Event listener for Load More button
loadMoreButton.addEventListener("click", () => {
  displayMovies();
});

// Fetch movies on page load
fetchMovies();
