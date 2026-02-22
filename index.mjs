let allUsersData = [];

export async function fetchUserData(username) {
  const url = `https://www.codewars.com/api/v1/users/${username}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`User "${username}" not found`);
  }

  return await response.json();
}