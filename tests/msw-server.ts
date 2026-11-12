import { setupServer } from "msw/node";

/** Base URL dùng trong test, khớp `test.env` ở vitest.config.mts. */
export const TEST_API_URL = "http://api.test/api";

export const server = setupServer();
