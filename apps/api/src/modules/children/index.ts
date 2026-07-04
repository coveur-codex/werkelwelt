import type { FastifyInstance } from "fastify";

export async function registerChildrenModule(app: FastifyInstance) {
  app.log.debug("children module registered as placeholder");
}
