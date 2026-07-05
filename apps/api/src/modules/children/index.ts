import type { FastifyInstance } from "fastify";

const parentAccountId = "local-test-parent";
const children = [{ id: "local-test-child", parentAccountId, displayName: "Testkind", avatarKey: "spark", currentPoints: 0, createdAt: "2026-01-01T00:00:00.000Z" }];

export async function registerChildrenModule(app: FastifyInstance) {
  // Mockable local family mode: child profiles have no e-mail and belong to the test parent account.
  app.get("/children", async () => children);
  app.post<{ Body: { displayName?: string; avatarKey?: string } }>("/children", async (request, reply) => {
    const displayName = request.body?.displayName?.trim();
    if (!displayName) return reply.code(400).send({ error: "displayName_required" });
    const child = { id: crypto.randomUUID(), parentAccountId, displayName, avatarKey: request.body.avatarKey ?? "spark", currentPoints: 0, createdAt: new Date().toISOString() };
    children.push(child);
    return reply.code(201).send(child);
  });
  app.get<{ Params: { childId: string } }>("/children/:childId", async (request, reply) => children.find((child) => child.id === request.params.childId) ?? reply.code(404).send({ error: "child_not_found" }));
  app.get<{ Params: { childId: string } }>("/children/:childId/summary", async (request) => ({ childId: request.params.childId, points: 0, lastSession: null }));
  app.get<{ Params: { childId: string } }>("/children/:childId/reward-events", async () => []);
  app.get<{ Params: { childId: string } }>("/children/:childId/points-summary", async (request) => ({ childId: request.params.childId, totalPoints: 0, byReason: {} }));
}
