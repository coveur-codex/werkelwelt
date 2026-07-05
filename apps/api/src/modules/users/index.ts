import type { FastifyInstance } from "fastify";

const TEST_PARENT_ACCOUNT = { id: "local-test-parent", displayName: "Test-Elternkonto", createdAt: "2026-01-01T00:00:00.000Z" };

export async function registerUsersModule(app: FastifyInstance) {
  // Local family mode until real authentication is introduced.
  app.get("/parent-accounts/current", async () => TEST_PARENT_ACCOUNT);
}
