# Werkelwelt

Werkelwelt ist eine geplante PWA/Web-App für Kinder mit Dyskalkulie. Dieses Repository enthält zunächst nur das technische Plattform-Setup als TypeScript-Monorepo; Lernlogik und didaktische Inhalte werden später ergänzt.

## Entwicklungsstart

Voraussetzungen:

- Node.js LTS
- pnpm
- Docker und Docker Compose für lokale Infrastruktur

Geplanter Ablauf für die lokale Entwicklung:

```bash
pnpm install
pnpm dev
```

Root-Skripte für `dev`, `build`, `lint` und `test` delegieren per pnpm an die Workspaces. Konkrete App-Skripte werden ergänzt, sobald die einzelnen Services implementiert werden.

## Docker-Start

Die Docker-Konfiguration wird unter `infra/docker`, `infra/caddy` und `infra/postgres` vorbereitet.

Geplanter Start:

```bash
docker compose up --build
```

Die Compose-Dateien und Service-Images werden ergänzt, sobald Web-App, API, Worker und Infrastruktur konkretisiert sind.

## Geplante Service-Übersicht

| Bereich | Pfad | Zweck |
| --- | --- | --- |
| Web-App | `apps/web` | PWA-Frontend für Kinder, Begleitpersonen und Lerninteraktionen |
| API | `apps/api` | Backend-API für App-Daten, Authentifizierung und Persistenz |
| Worker | `apps/worker` | Hintergrundjobs, Content-Verarbeitung und asynchrone Aufgaben |
| Math Engine | `packages/math-engine` | Deterministische Rechen- und Aufgabenlogik |
| Skill Graph | `packages/skill-graph` | Modellierung von Fähigkeiten, Abhängigkeiten und Lernpfaden |
| Content Model | `packages/content-model` | Gemeinsame Inhalts- und Aufgabenstrukturen |
| UI | `packages/ui` | Wiederverwendbare UI-Komponenten |
| Types | `packages/types` | Gemeinsame TypeScript-Typen für Apps und Packages |
| Infrastruktur | `infra/*` | Docker, Caddy und PostgreSQL-Konfiguration |
| Assets | `assets/*` | Quell- und Exportdateien für visuelle und mediale Assets |
| Dokumentation | `docs/*` | Architektur, Didaktik und Produktnotizen |

## Architekturhinweis

`packages/math-engine` soll deterministisch, gut testbar und unabhängig vom UI bleiben. Die Math Engine darf keine Abhängigkeit auf Frontend-Komponenten, Browser-APIs oder visuelle Darstellung haben, damit Aufgabenlogik reproduzierbar und in API, Worker sowie Tests wiederverwendbar bleibt.
