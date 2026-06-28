/**
 * GP Platform — full API client test suite
 *
 * Run:  npx vitest run
 * Watch: npx vitest
 * UI:   npx vitest --ui
 *
 * Every test is fully isolated:
 *  - MSW intercepts all HTTP (no real network traffic)
 *  - localStorage is cleared between tests (see setup.ts)
 *  - Per-test handler overrides are reset after each test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server";
import { fixtures } from "./mocks/handlers";

// ── Services under test ──────────────────────────────────────────────────────
import {
  register,
  login,
  refreshTokens,
  forgotPassword,
  resetPassword,
  logoutAll,
} from "../services/auth";

import {
  getProfile,
  updateProfile,
  changePassword,
  logout,
  toggleEmailNotifications,
  toggleInAppNotifications,
} from "../services/users";

import {
  getUserSpaces,
  getActiveSpaces,
  searchSpaces,
  getSpace,
  createSpace,
  joinSpace,
  leaveSpace,
} from "../services/spaces";

import {
  getSpacePosts,
  searchPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  markGoodQuestion,
  removeGoodQuestion,
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  unacceptAnswer,
  upvoteAnswer,
  removeUpvote,
} from "../services/posts";

import {
  getSpaceMaterials,
  getBookmarkedMaterials,
  searchMaterials,
  uploadFile,
  shareLink,
  bookmarkMaterial,
  removeBookmark,
  downloadMaterial,
  updateMaterial,
  deleteMaterial,
} from "../services/materials";

import {
  getNotifications,
  markNotificationRead,
  buildNotificationLink,
  countUnread,
} from "../services/notifications";

import {
  getMyGamificationProfile,
  getSystemLeaderboard,
  getSpaceLeaderboard,
} from "../services/gamification";

import {
  getCurrentCourses,
  getAllCourses,
  registerCourse,
  updateCourse,
  deleteCourse,
} from "../services/courses";

import { getSpaceRecommendations, getOnlineCourseRecommendations } from "../services/recommendations";

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTH
// ─────────────────────────────────────────────────────────────────────────────
describe("auth service", () => {
  describe("register()", () => {
    it("returns a RegisterResponse with userId, email, and fullName", async () => {
      const result = await register({
        fullName: "Ada Lovelace",
        email: "ada@test.com",
        password: "Test@1234",
      });
      expect(result.userId).toBe("user-1");
      expect(result.email).toBe("ada@test.com");
      expect(result.fullName).toBe("Ada Lovelace");
    });

    it("propagates server errors to the caller", async () => {
      server.use(
        http.post("http://localhost:8080/api/v1/auth/register", () =>
          HttpResponse.json(
            { success: false, message: "Email already in use", data: null },
            { status: 409 }
          )
        )
      );
      await expect(register({ fullName: "Ada", email: "ada@test.com", password: "Test@1234" }))
        .rejects.toMatchObject({ response: { status: 409 } });
    });
  });

  describe("login()", () => {
    it("returns AuthResponse containing a user object", async () => {
      const result = await login({ email: "ada@test.com", password: "Test@1234" });
      expect(result.token).toBe("access-token-abc");
      expect(result.user.email).toBe("ada@test.com");
    });

    it("stores accessToken in localStorage", async () => {
      await login({ email: "ada@test.com", password: "Test@1234" });
      expect(localStorage.getItem("accessToken")).toBe("access-token-abc");
    });

    it("stores refreshToken in localStorage", async () => {
      await login({ email: "ada@test.com", password: "Test@1234" });
      expect(localStorage.getItem("refreshToken")).toBe("refresh-token-xyz");
    });

    it("throws on invalid credentials", async () => {
      server.use(
        http.post("http://localhost:8080/api/v1/auth/login", () =>
          HttpResponse.json({ success: false, message: "Bad credentials", data: null }, { status: 401 })
        )
      );
      await expect(login({ email: "bad@test.com", password: "wrong" }))
        .rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe("refreshTokens()", () => {
    it("returns a new token pair", async () => {
      const result = await refreshTokens();
      expect(result.token).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
    });

    it("updates localStorage with the new tokens", async () => {
      await refreshTokens();
      expect(localStorage.getItem("accessToken")).toBe("new-access-token");
      expect(localStorage.getItem("refreshToken")).toBe("new-refresh-token");
    });
  });

  describe("forgotPassword()", () => {
    it("resolves without throwing (always 200)", async () => {
      await expect(forgotPassword({ email: "ada@test.com" })).resolves.toBeUndefined();
    });
  });

  describe("resetPassword()", () => {
    it("resolves without throwing on success", async () => {
      await expect(resetPassword({ token: "reset-token-abc", newPassword: "New@1234" }))
        .resolves.toBeUndefined();
    });
  });

  describe("logoutAll()", () => {
    it("clears localStorage", async () => {
      localStorage.setItem("accessToken", "x");
      localStorage.setItem("refreshToken", "y");
      await logoutAll();
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. USERS
// ─────────────────────────────────────────────────────────────────────────────
describe("users service", () => {
  describe("getProfile()", () => {
    it("returns a UserResponse with the expected fields", async () => {
      const result = await getProfile();
      expect(result.id).toBe("user-1");
      expect(result.email).toBe("ada@test.com");
      expect(result.fullName).toBe("Ada Lovelace");
      expect(result.department).toBe("Computer Science");
    });
  });

  describe("updateProfile()", () => {
    it("returns the updated user with the new fullName", async () => {
      const result = await updateProfile({ fullName: "Ada K. Lovelace" });
      expect(result.fullName).toBe("Ada K. Lovelace");
    });

    it("accepts partial updates (only the changed fields)", async () => {
      // Only bio is being changed — the service should still return a valid UserResponse
      const result = await updateProfile({ bio: "Mathematician and writer" });
      expect(result.id).toBe("user-1");
    });
  });

  describe("changePassword()", () => {
    it("resolves without throwing on success", async () => {
      await expect(
        changePassword({ currentPassword: "Old@1234", newPassword: "New@5678" })
      ).resolves.toBeUndefined();
    });

    it("propagates 400 when current password is wrong", async () => {
      server.use(
        http.post("http://localhost:8080/api/v1/users/change-password", () =>
          HttpResponse.json({ success: false, message: "Wrong password", data: null }, { status: 400 })
        )
      );
      await expect(changePassword({ currentPassword: "wrong", newPassword: "New@5678" }))
        .rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  describe("logout()", () => {
    it("clears localStorage after a successful logout", async () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");
      await logout();
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });
  });

  describe("toggleEmailNotifications()", () => {
    it("resolves without throwing", async () => {
      await expect(toggleEmailNotifications()).resolves.toBeUndefined();
    });
  });

  describe("toggleInAppNotifications()", () => {
    it("resolves without throwing", async () => {
      await expect(toggleInAppNotifications()).resolves.toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SPACES
// ─────────────────────────────────────────────────────────────────────────────
describe("spaces service", () => {
  describe("getUserSpaces()", () => {
    it("returns an array of SpaceResponse objects", async () => {
      const result = await getUserSpaces();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("space-1");
    });

    it("returns spaces with the correct shape", async () => {
      const [space] = await getUserSpaces();
      expect(space).toMatchObject({
        id: "space-1",
        name: "Algorithms & Data Structures",
        isActive: true,
        memberCount: 42,
      });
    });
  });

  describe("getActiveSpaces()", () => {
    it("returns an array of SpaceResponse objects", async () => {
      const result = await getActiveSpaces();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("space-1");
    });

    it("accepts custom page and size arguments", async () => {
      // The handler doesn't validate params, but we confirm the call doesn't throw
      await expect(getActiveSpaces(2, 5)).resolves.toBeDefined();
    });
  });

  describe("searchSpaces()", () => {
    it("returns an array of matched SpaceResponse objects", async () => {
      const result = await searchSpaces({ query: "algorithms" });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe("Algorithms & Data Structures");
    });

    it("accepts all optional filter params without throwing", async () => {
      await expect(
        searchSpaces({ query: "cs", category: "COLLEGE_COURSE", sortBy: "memberCount", sortDir: "desc" })
      ).resolves.toBeDefined();
    });
  });

  describe("getSpace()", () => {
    it("returns a single SpaceResponse by ID", async () => {
      const result = await getSpace("space-1");
      expect(result.id).toBe("space-1");
      expect(result.courseCode).toBe("CS301");
    });
  });

  describe("createSpace()", () => {
    it("returns the newly created SpaceResponse", async () => {
      const result = await createSpace({ name: "Algorithms & Data Structures", category: "COLLEGE_COURSE" });
      expect(result.id).toBe("space-1");
    });

    it("sends force=0 by default", async () => {
      let capturedUrl = "";
      server.use(
        http.post("http://localhost:8080/api/v1/spaces", ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, message: "OK", data: fixtures.space });
        })
      );
      await createSpace({ name: "Test Space" });
      expect(capturedUrl).toContain("force=0");
    });

    it("sends force=1 when forced", async () => {
      let capturedUrl = "";
      server.use(
        http.post("http://localhost:8080/api/v1/spaces", ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, message: "OK", data: fixtures.space });
        })
      );
      await createSpace({ name: "Test Space" }, true);
      expect(capturedUrl).toContain("force=1");
    });

    it("propagates the 409 AxiosError so the caller can show a conflict dialog", async () => {
      server.use(
        http.post("http://localhost:8080/api/v1/spaces", () =>
          HttpResponse.json(
            { success: false, message: "Conflict", data: [{ ...fixtures.space, similarityScore: 0.92 }] },
            { status: 409 }
          )
        )
      );
      await expect(createSpace({ name: "Algorithms" }))
        .rejects.toMatchObject({ response: { status: 409 } });
    });
  });

  describe("joinSpace()", () => {
    it("returns a MembershipResponse", async () => {
      const result = await joinSpace("space-1");
      expect(result.spaceId).toBe("space-1");
      expect(result.role).toBe("MEMBER");
    });
  });

  describe("leaveSpace()", () => {
    it("resolves without throwing", async () => {
      await expect(leaveSpace("space-1")).resolves.toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. POSTS
// ─────────────────────────────────────────────────────────────────────────────
describe("posts service", () => {
  describe("getSpacePosts()", () => {
    it("returns an array of AllPostsResponse objects", async () => {
      const result = await getSpacePosts("space-1");
      expect(result).toHaveLength(1);
      expect(result[0].postId).toBe("post-1");
    });

    it("defaults to page 0 and size 20", async () => {
      let capturedUrl = "";
      server.use(
        http.get("http://localhost:8080/api/v1/posts/all-posts/space-1/0/20", ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, message: "OK", data: [fixtures.allPost] });
        })
      );
      await getSpacePosts("space-1");
      expect(capturedUrl).toContain("/0/20");
    });
  });

  describe("searchPosts()", () => {
    it("returns matching posts", async () => {
      const result = await searchPosts("space-1", { query: "merge sort" });
      expect(result[0].title).toContain("merge sort");
    });

    it("accepts isSolved filter", async () => {
      await expect(
        searchPosts("space-1", { isSolved: false, sortBy: "goodQuestionCount", sortDir: "asc" })
      ).resolves.toBeDefined();
    });
  });

  describe("getPost()", () => {
    it("returns a single PostResponse", async () => {
      const result = await getPost("post-1");
      expect(result.id).toBe("post-1");
      expect(result.isSolved).toBe(false);
    });
  });

  describe("createPost()", () => {
    it("returns the created post with the correct spaceId", async () => {
      const result = await createPost("space-1", {
        title: "How does merge sort achieve O(n log n)?",
        body: "I understand that merge sort splits the array in half recursively but struggle with the complexity.",
      });
      expect(result.spaceId).toBe("space-1");
      expect(result.authorId).toBe("user-1");
    });
  });

  describe("updatePost()", () => {
    it("returns the post with the updated title", async () => {
      const result = await updatePost("post-1", { title: "Updated: How does merge sort work?" });
      expect(result.title).toBe("Updated: How does merge sort work?");
    });
  });

  describe("deletePost()", () => {
    it("resolves without throwing", async () => {
      await expect(deletePost("post-1")).resolves.toBeUndefined();
    });
  });

  describe("markGoodQuestion() / removeGoodQuestion()", () => {
    it("marks a good question without throwing", async () => {
      await expect(markGoodQuestion("post-1")).resolves.toBeUndefined();
    });

    it("removes a good question vote without throwing", async () => {
      await expect(removeGoodQuestion("post-1")).resolves.toBeUndefined();
    });
  });

  // ── Answers ──────────────────────────────────────────────────────────────

  describe("getAnswers()", () => {
    it("returns an array of AnswerResponse objects", async () => {
      const result = await getAnswers("post-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("answer-1");
      expect(result[0].postId).toBe("post-1");
    });
  });

  describe("createAnswer()", () => {
    it("returns the created AnswerResponse", async () => {
      const result = await createAnswer("post-1", {
        body: "The key insight is that each merge step processes all n elements.",
      });
      expect(result.postId).toBe("post-1");
      expect(result.upvoteCount).toBe(5);
    });
  });

  describe("updateAnswer()", () => {
    it("returns the answer with updated body", async () => {
      const result = await updateAnswer("answer-1", { body: "Updated answer body with more detail." });
      expect(result.body).toBe("Updated answer body with more detail.");
    });
  });

  describe("deleteAnswer()", () => {
    it("resolves without throwing", async () => {
      await expect(deleteAnswer("answer-1")).resolves.toBeUndefined();
    });
  });

  describe("acceptAnswer() / unacceptAnswer()", () => {
    it("accepts an answer without throwing", async () => {
      await expect(acceptAnswer("post-1", "answer-1")).resolves.toBeUndefined();
    });

    it("unaccepts an answer without throwing", async () => {
      await expect(unacceptAnswer("post-1")).resolves.toBeUndefined();
    });
  });

  describe("upvoteAnswer() / removeUpvote()", () => {
    it("upvotes an answer without throwing", async () => {
      await expect(upvoteAnswer("answer-1")).resolves.toBeUndefined();
    });

    it("removes an upvote without throwing", async () => {
      await expect(removeUpvote("answer-1")).resolves.toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. MATERIALS
// ─────────────────────────────────────────────────────────────────────────────
describe("materials service", () => {
  describe("getSpaceMaterials()", () => {
    it("returns a PagedResponse with material content", async () => {
      const result = await getSpaceMaterials("space-1");
      expect(result.content).toHaveLength(1);
      expect(result.content[0].id).toBe("material-1");
      expect(result.content[0].resourceType).toBe("PDF");
    });

    it("accepts custom page and size", async () => {
      await expect(getSpaceMaterials("space-1", 1, 10)).resolves.toBeDefined();
    });
  });

  describe("getBookmarkedMaterials()", () => {
    it("returns only bookmarked materials (isBookmarked: true)", async () => {
      const result = await getBookmarkedMaterials("space-1");
      expect(result.content[0].isBookmarked).toBe(true);
    });
  });

  describe("searchMaterials()", () => {
    it("returns an array of MaterialResponse objects", async () => {
      const result = await searchMaterials("space-1", { query: "lecture" });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Lecture Slides Week 3");
    });

    it("accepts resourceType filter", async () => {
      await expect(
        searchMaterials("space-1", { resourceType: "PDF", sortBy: "linkCount", sortDir: "desc" })
      ).resolves.toBeDefined();
    });
  });

  describe("uploadFile()", () => {
    it("returns the created MaterialResponse", async () => {
      const file = new File(["PDF bytes"], "slides.pdf", { type: "application/pdf" });
      const result = await uploadFile("space-1", "Lecture Slides Week 3", file, "Covers merge sort");
      expect(result.id).toBe("material-1");
      expect(result.resourceType).toBe("PDF");
    });

    it("works without an optional description", async () => {
      const file = new File(["content"], "notes.txt", { type: "text/plain" });
      await expect(uploadFile("space-1", "My Notes", file)).resolves.toBeDefined();
    });
  });

  describe("shareLink()", () => {
    it("returns a MaterialResponse with resourceType LINK", async () => {
      const result = await shareLink("space-1", {
        title: "MDN: Array.prototype.sort",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
      });
      expect(result.resourceType).toBe("LINK");
    });
  });

  describe("bookmarkMaterial() / removeBookmark()", () => {
    it("bookmarks a material without throwing", async () => {
      await expect(bookmarkMaterial("material-1")).resolves.toBeUndefined();
    });

    it("removes a bookmark without throwing", async () => {
      await expect(removeBookmark("material-1")).resolves.toBeUndefined();
    });
  });

  describe("downloadMaterial()", () => {
    /**
     * jsdom does not implement responseType:"blob" — Axios falls back to
     * returning the raw response string instead of a Blob object.
     * We therefore assert on what jsdom CAN give us: a defined, non-empty
     * response, and that the service function itself doesn't throw.
     * Full Blob behaviour is covered by integration tests against the real backend.
     */
    it("resolves without throwing", async () => {
      await expect(downloadMaterial("material-1")).resolves.toBeDefined();
    });

    it("returns a non-null value (jsdom blob fallback)", async () => {
      const result = await downloadMaterial("material-1");
      expect(result).not.toBeNull();
    });
  });

  describe("updateMaterial()", () => {
    it("returns the material with the updated title", async () => {
      const result = await updateMaterial("material-1", { title: "Updated Slides" });
      expect(result.title).toBe("Updated Slides");
    });
  });

  describe("deleteMaterial()", () => {
    it("resolves without throwing", async () => {
      await expect(deleteMaterial("material-1")).resolves.toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
describe("notifications service", () => {
  describe("getNotifications()", () => {
    it("returns a PagedResponse with notification content", async () => {
      const result = await getNotifications();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].id).toBe("notif-1");
    });

    it("contains the unread notification (isRead: false)", async () => {
      const result = await getNotifications();
      expect(result.content[0].isRead).toBe(false);
    });

    it("accepts custom page and size", async () => {
      await expect(getNotifications(0, 25)).resolves.toBeDefined();
    });
  });

  describe("markNotificationRead()", () => {
    it("resolves without throwing", async () => {
      await expect(markNotificationRead("notif-1")).resolves.toBeUndefined();
    });
  });

  // ── Pure helpers (no HTTP) ────────────────────────────────────────────────

  describe("buildNotificationLink()", () => {
    it("maps NEW_POST to /posts/:id", () => {
      expect(buildNotificationLink("NEW_POST", "post-1")).toBe("/posts/post-1");
    });

    it("maps NEW_ANSWER to /posts/:id", () => {
      expect(buildNotificationLink("NEW_ANSWER", "post-1")).toBe("/posts/post-1");
    });

    it("maps ANSWER_ACCEPTED to /posts/:id", () => {
      expect(buildNotificationLink("ANSWER_ACCEPTED", "post-1")).toBe("/posts/post-1");
    });

    it("maps GOOD_QUESTION to /posts/:id", () => {
      expect(buildNotificationLink("GOOD_QUESTION", "post-1")).toBe("/posts/post-1");
    });

    it("maps UPVOTE to /posts/:id", () => {
      expect(buildNotificationLink("UPVOTE", "post-1")).toBe("/posts/post-1");
    });

    it("maps NEW_MATERIAL to /materials/:id", () => {
      expect(buildNotificationLink("NEW_MATERIAL", "material-1")).toBe("/materials/material-1");
    });

    it("falls back to /notifications for unknown referenceType", () => {
      expect(buildNotificationLink("UNKNOWN_TYPE", "some-id")).toBe("/notifications");
    });

    it("falls back to /notifications when referenceType is undefined", () => {
      expect(buildNotificationLink(undefined, "some-id")).toBe("/notifications");
    });

    it("falls back to /notifications when referenceId is undefined", () => {
      expect(buildNotificationLink("NEW_POST", undefined)).toBe("/notifications");
    });

    it("falls back to /notifications when both args are undefined", () => {
      expect(buildNotificationLink(undefined, undefined)).toBe("/notifications");
    });
  });

  describe("countUnread()", () => {
    it("counts only unread notifications (isRead: false)", () => {
      const notifications = [
        { ...fixtures.notification, isRead: false },
        { ...fixtures.notification, id: "notif-2", isRead: true },
        { ...fixtures.notification, id: "notif-3", isRead: false },
      ];
      expect(countUnread(notifications)).toBe(2);
    });

    it("returns 0 when all notifications are read", () => {
      const notifications = [
        { ...fixtures.notification, isRead: true },
        { ...fixtures.notification, id: "notif-2", isRead: true },
      ];
      expect(countUnread(notifications)).toBe(0);
    });

    it("returns 0 for an empty array", () => {
      expect(countUnread([])).toBe(0);
    });

    it("returns the full length when all are unread", () => {
      const notifications = [
        { ...fixtures.notification, isRead: false },
        { ...fixtures.notification, id: "notif-2", isRead: false },
        { ...fixtures.notification, id: "notif-3", isRead: false },
      ];
      expect(countUnread(notifications)).toBe(3);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. GAMIFICATION
// ─────────────────────────────────────────────────────────────────────────────
describe("gamification service", () => {
  describe("getMyGamificationProfile()", () => {
    it("returns the authenticated user's gamification profile", async () => {
      const result = await getMyGamificationProfile();
      expect(result.userId).toBe("user-1");
      expect(result.xpPoints).toBe(1250);
      expect(result.level).toBe(5);
    });

    it("includes streak fields", async () => {
      const result = await getMyGamificationProfile();
      expect(result.currentStreakDays).toBe(4);
      expect(result.longestStreakDays).toBe(14);
    });

    it("includes activity counter fields", async () => {
      const result = await getMyGamificationProfile();
      expect(result.totalPosts).toBe(12);
      expect(result.totalAnswers).toBe(34);
      expect(result.totalUpvotesReceived).toBe(89);
      expect(result.totalMaterialsShared).toBe(7);
    });
  });

  describe("getSystemLeaderboard()", () => {
    it("returns an array of SystemLeaderboardEntry objects", async () => {
      const result = await getSystemLeaderboard();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].rank).toBe(1);
    });

    it("entries contain XP and level", async () => {
      const [entry] = await getSystemLeaderboard();
      expect(entry.xpPoints).toBe(1250);
      expect(entry.level).toBe(5);
    });

    it("accepts a custom limit argument", async () => {
      await expect(getSystemLeaderboard(10)).resolves.toBeDefined();
    });
  });

  describe("getSpaceLeaderboard()", () => {
    it("returns space-scoped leaderboard entries", async () => {
      const result = await getSpaceLeaderboard("space-1");
      expect(result[0].postsInSpace).toBe(3);
      expect(result[0].answersInSpace).toBe(8);
      expect(result[0].materialsSharedInSpace).toBe(2);
    });

    it("accepts a custom limit argument", async () => {
      await expect(getSpaceLeaderboard("space-1", 5)).resolves.toBeDefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. COURSES
// ─────────────────────────────────────────────────────────────────────────────
describe("courses service", () => {
  describe("getCurrentCourses()", () => {
    it("returns only current courses (closed: false)", async () => {
      const result = await getCurrentCourses();
      expect(result).toHaveLength(1);
      expect(result[0].closed).toBe(false);
    });

    it("includes the correct course fields", async () => {
      const [course] = await getCurrentCourses();
      expect(course.code).toBe("CS301");
      expect(course.termWork).toBe(35.0);
    });
  });

  describe("getAllCourses()", () => {
    it("returns both current and past courses", async () => {
      const result = await getAllCourses();
      expect(result).toHaveLength(2);
    });

    it("includes a past course with closed: true", async () => {
      const result = await getAllCourses();
      const pastCourse = result.find((c) => c.closed);
      expect(pastCourse).toBeDefined();
      expect(pastCourse?.grade).toBe("B+");
    });
  });

  describe("registerCourse()", () => {
    it("returns the newly registered CourseRegistrationResponse", async () => {
      const result = await registerCourse({
        code: "CS301",
        termWork: 35.0,
        examWork: 55.0,
      });
      expect(result.id).toBe(1);
      expect(result.closed).toBe(false);
    });
  });

  describe("updateCourse()", () => {
    it("returns the course with updated grade and result", async () => {
      const result = await updateCourse("1", { termWork: 35.0, examWork: 55.0, closed: true });
      expect(result.grade).toBe("A+");
      expect(result.result).toBe(90.0);
    });

    it("accepts partial updates", async () => {
      await expect(updateCourse("1", { closed: true })).resolves.toBeDefined();
    });
  });

  describe("deleteCourse()", () => {
    it("resolves without throwing", async () => {
      await expect(deleteCourse("1")).resolves.toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. AXIOS INTERCEPTOR — silent token refresh
// ─────────────────────────────────────────────────────────────────────────────
describe("api interceptor", () => {
  /**
   * This section tests the most critical infrastructure: when the server
   * returns 401, the interceptor should silently call /auth/refresh, store
   * the new tokens, and retry the original request — all transparent to the caller.
   *
   * jsdom throws "Not implemented: navigation" when code sets window.location.href.
   * We replace location with a plain object before these tests and restore it after.
   */

  let locationSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "valid-refresh-token");

    // Silence the jsdom navigation error caused by window.location.href = "/login"
    locationSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, set href(url: string) { new locationSpy(url); } },
    });
  });

  afterEach(() => {
    // Restore window.location to the real jsdom object
    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/"),
    });
  });

  it("retries the original request after a successful token refresh", async () => {
    let callCount = 0;

    server.use(
      http.get("http://localhost:8080/api/v1/spaces/all-spaces", () => {
        callCount++;
        if (callCount === 1) {
          return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({ success: true, message: "OK", data: [fixtures.space] });
      }),

      http.post("http://localhost:8080/api/v1/auth/refresh", () =>
        HttpResponse.json({
          success: true,
          message: "OK",
          data: { token: "new-access-token", tokenType: "Bearer", refreshToken: "new-refresh-token", user: fixtures.auth.user },
        })
      )
    );

    const result = await getUserSpaces();
    expect(result).toHaveLength(1);
    expect(callCount).toBe(2); // 1st call = 401, 2nd call = 200 (retry)
  });

  it("stores the new access token after a successful refresh", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/spaces/all-spaces", ({ request }) => {
        const auth = request.headers.get("Authorization");
        if (auth === "Bearer expired-token") {
          return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({ success: true, message: "OK", data: [fixtures.space] });
      }),

      http.post("http://localhost:8080/api/v1/auth/refresh", () =>
        HttpResponse.json({
          success: true,
          message: "OK",
          data: { token: "brand-new-token", tokenType: "Bearer", refreshToken: "brand-new-refresh", user: fixtures.auth.user },
        })
      )
    );

    await getUserSpaces();
    expect(localStorage.getItem("accessToken")).toBe("brand-new-token");
    expect(localStorage.getItem("refreshToken")).toBe("brand-new-refresh");
  });

  it("does not retry a second time when refresh itself fails (avoids infinite loop)", async () => {
    let getCallCount = 0;

    server.use(
      http.get("http://localhost:8080/api/v1/spaces/all-spaces", () => {
        getCallCount++;
        return new HttpResponse(null, { status: 401 });
      }),

      http.post("http://localhost:8080/api/v1/auth/refresh", () =>
        new HttpResponse(null, { status: 401 })
      )
    );

    // The interceptor should reject rather than loop
    await expect(getUserSpaces()).rejects.toBeDefined();
    // The original request should have been called exactly once (no infinite retry)
    expect(getCallCount).toBe(1);
  });

  it("clears localStorage when refresh fails", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/spaces/all-spaces", () =>
        new HttpResponse(null, { status: 401 })
      ),
      http.post("http://localhost:8080/api/v1/auth/refresh", () =>
        new HttpResponse(null, { status: 401 })
      )
    );

    await expect(getUserSpaces()).rejects.toBeDefined();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    // Interceptor must have attempted to redirect to /login
    expect(locationSpy).toHaveBeenCalledWith("/login");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────────────────────
describe("recommendations service", () => {
  describe("getSpaceRecommendations()", () => {
    it("returns an array of SpaceRecommendationResponse objects", async () => {
      const result = await getSpaceRecommendations();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(0.95);
      expect(result[0].methodCount).toBe(2);
      expect(result[0].reasons).toContain("COURSE_MATCH");
      expect(result[0].space.id).toBe("space-1");
    });
  });

  describe("getOnlineCourseRecommendations()", () => {
    it("returns online course recommendations", async () => {
      const result = await getOnlineCourseRecommendations();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
      expect(result[0].title).toBe("Algorithms, Part I");
      expect(result[0].source).toBe("Coursera");
      expect(result[0].price).toBe(0.0);
      expect(result[1].source).toBe("Udemy");
      expect(result[1].price).toBe(19.99);
    });
  });
});