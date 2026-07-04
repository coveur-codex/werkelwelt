import Fastify from "fastify";
import packageJson from "../package.json" with { type: "json" };
import { registerChildrenModule } from "./modules/children/index.js";
import { registerLearningEventsModule } from "./modules/learning-events/index.js";
import { registerSkillsModule } from "./modules/skills/index.js";
import { registerUsersModule } from "./modules/users/index.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok", service: "api" }));
  app.get("/version", async () => ({ version: packageJson.version, service: "api" }));

  // Future PostgreSQL integration can be registered here as a Fastify plugin.
  void registerUsersModule(app);
  void registerChildrenModule(app);
  void registerLearningEventsModule(app);
  void registerSkillsModule(app);

  return app;
}
