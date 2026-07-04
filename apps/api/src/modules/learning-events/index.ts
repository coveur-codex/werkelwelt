import type { FastifyInstance } from "fastify";

export async function registerLearningEventsModule(app: FastifyInstance) {
  app.log.debug("learning-events module registered as placeholder");
}
