let allUsersData = [];

export async function fetchUserData(username) {
  const url = `https://www.codewars.com/api/v1/users/${username}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`User "${username}" not found`);
  }

  return await response.json();
}

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

function showMessage(text, isError = false) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = isError ? "error" : "loading";
  messageDiv.classList.remove("hidden");
}

function hideMessage() {
  document.getElementById("message").classList.add("hidden");
}

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
    const fetchPromises = usernames.map((username) => fetchUserData(username));
    allUsersData = await Promise.all(fetchPromises);

    hideMessage();
    const languages = getAllLanguages(allUsersData);
    updateLanguageDropdown(languages);

    const leaderboard = createLeaderboard(allUsersData, "overall");
    displayLeaderboard(leaderboard);
  } catch (error) {
    showMessage(error.message || "Failed to fetch leaderboard data", true);
  }
}

if (typeof window !== "undefined") {
  document.getElementById("fetchButton").addEventListener("click", handleFetchLeaderboard);
}
