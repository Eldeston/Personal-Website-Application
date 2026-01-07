// Main function

const backgroundToggle = document.getElementById("mainCanvas");
const themeButton = document.getElementById("themeButton")
const header = document.querySelector("header");
const footer = document.querySelector("footer");
const main = document.querySelector("main");

themeButton.addEventListener("click", () => {
    document.documentElement.classList.toggle("themeToggle");
    themeButton.textContent = document.documentElement.classList.contains("themeToggle") ? "☀️ Light" : "🌙 Dark";
});

backgroundToggle.addEventListener("click", () => {
    header.classList.toggle("show");
    main.classList.toggle("show");
    footer.classList.toggle("show");
});

// Call on page load
window.addEventListener('load', () => {
    initializeSpeedInsights();
});

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    themeButton.classList.toggle("show");
    header.classList.toggle("show");
    main.classList.toggle("show");
    footer.classList.toggle("show");

    // Replace with dynamic username if needed
    fetchGithubStats('eldeston');
    // Replace with dynamic guild id if needed
    fetchDiscordStats('604061216779796492');
});