import type { FastifyInstance } from "fastify";

export async function registerSkillsModule(app: FastifyInstance) {
  app.log.debug("skills module registered as placeholder");
}
