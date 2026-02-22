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