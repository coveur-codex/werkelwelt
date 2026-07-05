import type { FastifyInstance } from "fastify";

const sessions: Array<Record<string, unknown>> = [];

export async function registerLearningEventsModule(app: FastifyInstance) {
  app.post<{ Body: { childProfileId: string; plannedTaskCount?: number } }>("/learning-sessions", async (request, reply) => {
    const session = { id: crypto.randomUUID(), childProfileId: request.body.childProfileId, operation: "addition", status: "active", plannedTaskCount: request.body.plannedTaskCount ?? 3, completedTaskCount: 0, startedAt: new Date().toISOString() };
    sessions.push(session);
    return reply.code(201).send(session);
  });
  app.get<{ Params: { sessionId: string } }>("/learning-sessions/:sessionId", async (request, reply) => sessions.find((session) => session.id === request.params.sessionId) ?? reply.code(404).send({ error: "session_not_found" }));
  app.post<{ Params: { sessionId: string }; Body: { mood?: string } }>("/learning-sessions/:sessionId/complete", async (request, reply) => {
    const session = sessions.find((item) => item.id === request.params.sessionId);
    if (!session) return reply.code(404).send({ error: "session_not_found" });
    Object.assign(session, { status: "completed", mood: request.body?.mood, completedAt: new Date().toISOString() });
    return session;
  });
}
