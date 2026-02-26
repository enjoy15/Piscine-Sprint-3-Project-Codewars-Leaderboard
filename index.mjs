// Array to store all user data fetched from the API
let allUsersData = [];

// Function to fetch user data from the Codewars API
// Takes a username as input and returns the user's data as JSON
export async function fetchUserData(username) {
  const url = `https://www.codewars.com/api/v1/users/${username}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`User "${username}" not found`);
  }

  return await response.json();
}

// Function to extract all unique languages from the users' data
// Returns a sorted array of language names
export function getAllLanguages(usersData) {
  const languages = new Set();

  for (const user of usersData) {
    if (user.ranks && user.ranks.languages) {
      const userLanguages = Object.keys(user.ranks.languages);
      for (const language of userLanguages) {
        languages.add(language);
      }
    }
  }

  return Array.from(languages).sort();
}

// Function to get the score of a user for a specific language
// Returns the score for the given language or null if not available
export function getScore(user, language) {
  if (!user.ranks) {
    return null;
  }

  if (language === "overall") {
    return user.ranks.overall ? user.ranks.overall.score : null;
  }

  return user.ranks.languages && user.ranks.languages[language]
    ? user.ranks.languages[language].score
    : null;
}

// Function to create a leaderboard based on users' scores for a specific language
// Returns an array of users sorted by their scores in descending order
export function createLeaderboard(usersData, language) {
  const usersWithScores = [];

  for (const user of usersData) {
    const score = getScore(user, language);

    if (score !== null) {
      usersWithScores.push({
        username: user.username,
        clan: user.clan || "",
        score
      });
    }
  }

  usersWithScores.sort((a, b) => b.score - a.score);
  return usersWithScores;
}

// Function to display the leaderboard in the table
// Highlights the top user and displays their username, clan, and score
function displayLeaderboard(leaderboard) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  if (leaderboard.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3">No users found for this language</td></tr>';
    return;
  }

  leaderboard.forEach((user, index) => {
    const row = document.createElement("tr");

    if (index === 0) {
      row.className = "top-user";
    }

    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.clan}</td>
      <td>${user.score}</td>
    `;

    tableBody.appendChild(row);
  });

  document.getElementById("leaderboardTable").classList.remove("hidden");
}

// Function to show a message to the user
// Can display error or loading messages
function showMessage(text, isError = false) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = isError ? "error" : "loading";
  messageDiv.classList.remove("hidden");
}

// Function to hide the message displayed to the user
function hideMessage() {
  document.getElementById("message").classList.add("hidden");
}

// Function to update the language dropdown with available languages
// Adds "Overall" as the default option
function updateLanguageDropdown(languages) {
  const select = document.getElementById("languageSelect");
  select.innerHTML = '<option value="overall">Overall</option>';

  languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    select.appendChild(option);
  });

  document.getElementById("languageSection").classList.remove("hidden");
}

// Function to handle fetching leaderboard data
// Fetches data for the entered usernames and updates the leaderboard
async function handleFetchLeaderboard() {
  const input = document.getElementById("usernames").value;
  const usernames = input
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name);

  if (usernames.length === 0) {
    showMessage("Please enter at least one username", true);
    return;
  }

  showMessage("Loading leaderboard data...");

  try {
    // Fetch data for all usernames entered by the user
    const fetchPromises = usernames.map((username) => fetchUserData(username));
    // Wait for all fetch requests to complete and store the results in allUsersData
    allUsersData = await Promise.all(fetchPromises);

    // Hide the loading message after data is successfully fetched
    hideMessage();

    // Extract all unique languages from the fetched user data
    const languages = getAllLanguages(allUsersData);
    // Update the language dropdown with the extracted languages
    updateLanguageDropdown(languages);

    // Create and display the leaderboard for the default "overall" ranking
    const leaderboard = createLeaderboard(allUsersData, "overall");
    displayLeaderboard(leaderboard);
  } catch (error) {
    showMessage(error.message || "Failed to fetch leaderboard data", true);
  }
}

// Function to handle changes in the selected language
// Updates the leaderboard table based on the selected language
function handleLanguageChange() {
  const selectedLanguage = document.getElementById("languageSelect").value;
  const leaderboard = createLeaderboard(allUsersData, selectedLanguage);
  displayLeaderboard(leaderboard);
}

// Add event listeners for button click and dropdown change
if (typeof window !== "undefined") {
  document.getElementById("fetchButton").addEventListener("click", handleFetchLeaderboard);
  document.getElementById("languageSelect").addEventListener("change", handleLanguageChange);
}
