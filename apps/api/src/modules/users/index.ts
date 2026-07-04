import type { FastifyInstance } from "fastify";

export async function registerUsersModule(app: FastifyInstance) {
  app.log.debug("users module registered as placeholder");
}
