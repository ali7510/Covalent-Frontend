import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./mocks/server";

// Start the MSW interception server before any test runs
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Wipe any per-test handler overrides so tests stay isolated
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

// Shut down after the full suite
afterAll(() => server.close());