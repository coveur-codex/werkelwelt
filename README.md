# Werkelwelt

Werkelwelt ist eine geplante PWA/Web-App für Kinder mit Dyskalkulie. Dieses Repository enthält zunächst nur das technische Plattform-Setup als TypeScript-Monorepo; Lernlogik und didaktische Inhalte werden später ergänzt.

## Entwicklungsstart

Voraussetzungen:

- Node.js LTS
- npm (oder ein kompatibler Package-Manager)
- Docker und Docker Compose für lokale Infrastruktur

```bash
npm install
npm run dev
```

## Lokale Entwicklung mit Docker Compose

Das lokale Entwicklungssetup liegt in `compose.dev.yml` im Repository-Root. Es startet die Services `web`, `api`, `worker`, `postgres`, `redis` und `minio`.

| Service | Erreichbarkeit |
| --- | --- |
| Web | <http://localhost:3000> |
| Web-Healthcheck | <http://localhost:3000/api/health> |
| API | <http://localhost:4000> |
| API-Healthcheck | <http://localhost:4000/health> |
| PostgreSQL | intern als `postgres:5432` |
| Redis | intern als `redis:6379` |
| MinIO API | intern als `minio:9000` |
| MinIO Console | <http://localhost:9001> |

Die Beispielwerte in `.env.example` sind ausschließlich lokale Entwicklungswerte und keine produktiven Secrets.

### Starten

```bash
docker compose -f compose.dev.yml up --build
```

### Stoppen

```bash
docker compose -f compose.dev.yml down
```

### Logs anschauen

Alle Logs:

```bash
docker compose -f compose.dev.yml logs -f
```

Logs eines einzelnen Services, zum Beispiel API:

```bash
docker compose -f compose.dev.yml logs -f api
```

### Volumes löschen

PostgreSQL- und MinIO-Daten liegen in den benannten Volumes `postgres_data` und `minio_data`. Zum Löschen aller Compose-Volumes:

```bash
docker compose -f compose.dev.yml down -v
```

## Datenmodell und Migrationen

Die Datenmodell-Vorbereitung ist in `docs/architecture/data-model.md` dokumentiert. Migrationen liegen in `apps/api/migrations` und werden mit `node-pg-migrate` ausgeführt.

```bash
docker compose -f compose.dev.yml run --rm api npm run db:migrate
```

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
