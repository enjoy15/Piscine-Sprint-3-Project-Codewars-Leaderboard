let allUsersData = [];

export async function fetchUserData(username) {
  const url = `https://www.codewars.com/api/v1/users/${username}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`User "${username}" not found`);
  }

  return await response.json();
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
    showMessage(`Loaded ${allUsersData.length} users. Leaderboard rendering is added in the next PR.`);
  } catch (error) {
    showMessage(error.message || "Failed to fetch leaderboard data", true);
  }
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

if (typeof window !== "undefined") {
  document.getElementById("fetchButton").addEventListener("click", handleFetchLeaderboard);
}
