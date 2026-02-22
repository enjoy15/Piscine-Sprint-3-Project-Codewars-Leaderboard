import test from "node:test";
import assert from "node:assert";
import nock from "nock";

import {
  fetchUserData,
  getAllLanguages,
  getScore,
  createLeaderboard
} from "./index.mjs";

test("fetchUserData fetches user data from Codewars API", async () => {
  const fakeUserData = {
    username: "testuser",
    ranks: {
      overall: { score: 100 }
    }
  };

  const scope = nock("https://www.codewars.com")
    .get("/api/v1/users/testuser")
    .reply(200, fakeUserData);

  const result = await fetchUserData("testuser");

  assert.strictEqual(result.username, "testuser");
  assert.strictEqual(result.ranks.overall.score, 100);
  assert(scope.isDone(), "API call was not made");
});

test("fetchUserData throws error for non-existent user", async () => {
  const scope = nock("https://www.codewars.com")
    .get("/api/v1/users/nonexistent")
    .reply(404);

  await assert.rejects(
    async () => await fetchUserData("nonexistent"),
    { message: 'User "nonexistent" not found' }
  );

  assert(scope.isDone(), "API call was not made");
});

test("getAllLanguages returns unique languages from all users", () => {
  const usersData = [
    {
      username: "user1",
      ranks: {
        languages: {
          javascript: { score: 100 },
          python: { score: 50 }
        }
      }
    },
    {
      username: "user2",
      ranks: {
        languages: {
          javascript: { score: 80 },
          ruby: { score: 30 }
        }
      }
    }
  ];

  const languages = getAllLanguages(usersData);
  assert.deepStrictEqual(languages, ["javascript", "python", "ruby"]);
});

test("getScore returns overall score when language is overall", () => {
  const user = {
    username: "testuser",
    ranks: {
      overall: { score: 500 }
    }
  };

  const score = getScore(user, "overall");
  assert.strictEqual(score, 500);
});

test("getScore returns language-specific score", () => {
  const user = {
    username: "testuser",
    ranks: {
      languages: {
        javascript: { score: 200 }
      }
    }
  };

  const score = getScore(user, "javascript");
  assert.strictEqual(score, 200);
});

test("getScore returns null for missing language", () => {
  const user = {
    username: "testuser",
    ranks: {
      languages: {
        javascript: { score: 200 }
      }
    }
  };

  const score = getScore(user, "python");
  assert.strictEqual(score, null);
});

test("createLeaderboard sorts users by score descending", () => {
  const usersData = [
    {
      username: "user1",
      clan: "ClanA",
      ranks: {
        overall: { score: 100 }
      }
    },
    {
      username: "user2",
      clan: "ClanB",
      ranks: {
        overall: { score: 300 }
      }
    },
    {
      username: "user3",
      clan: "ClanC",
      ranks: {
        overall: { score: 200 }
      }
    }
  ];

  const leaderboard = createLeaderboard(usersData, "overall");

  assert.strictEqual(leaderboard[0].username, "user2");
  assert.strictEqual(leaderboard[1].username, "user3");
  assert.strictEqual(leaderboard[2].username, "user1");
});

test("createLeaderboard excludes users missing selected language", () => {
  const usersData = [
    {
      username: "user1",
      ranks: {
        languages: {
          javascript: { score: 100 }
        }
      }
    },
    {
      username: "user2",
      ranks: {
        languages: {
          python: { score: 200 }
        }
      }
    }
  ];

  const leaderboard = createLeaderboard(usersData, "javascript");
  assert.strictEqual(leaderboard.length, 1);
  assert.strictEqual(leaderboard[0].username, "user1");
});