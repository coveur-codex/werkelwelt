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

## Nutzerverwaltung im MVP

Die Web-App enthält einen lokalen MVP für Authentifizierung, Rollen und Kinderprofile. Die Daten liegen während dieser Phase im Browser-`localStorage`; Passwörter werden dabei nicht im Klartext, sondern per PBKDF2-SHA-256 mit Salt gespeichert. Die Repository-Schicht in `apps/web/src/lib` trennt Nutzer-, Familien-, Lern- und Punkte-Daten so, dass eine spätere PostgreSQL-Anbindung möglich bleibt.

### Ersten Admin lokal anlegen

Für lokale Entwicklung kann der erste Admin über Beispiel-Environment-Variablen vorbereitet werden. Lege dafür eine nicht eingecheckte `.env.local` in `apps/web` oder im Startkontext an:

```bash
NEXT_PUBLIC_INITIAL_ADMIN_EMAIL=admin@example.test
NEXT_PUBLIC_INITIAL_ADMIN_PASSWORD=change-me
NEXT_PUBLIC_INITIAL_ADMIN_NAME=Admin
```

Beim Öffnen von `/login` wird dieser Admin angelegt, falls im lokalen Browser noch kein Admin existiert. Die Werte in `.env.example` sind nur Beispiele und keine produktiven Zugangsdaten.

### Lokaler Ablauf

1. App starten: `npm run dev` oder `docker compose -f compose.dev.yml up --build`.
2. `/login` öffnen und mit dem initialen Admin anmelden.
3. Im Adminbereich `/admin` ein Elternprofil mit Name, E-Mail und initialem Passwort anlegen.
4. Abmelden und als Elternkonto auf `/login` anmelden.
5. Im Elternbereich `/parent` ein Kindprofil anlegen und auswählen.
6. Die Plus-Werkstatt über `/kind/addition` starten; Lernereignisse, Werkelpunkte und Lernstände werden dem aktiven Kindprofil zugeordnet.

Kinderprofile haben keine E-Mail-Adresse, kein Passwort und kein eigenes Login. Eltern sehen nur die Kinder, die mit ihrem Elternkonto verknüpft sind. Der Adminbereich ist auf Admin-Konten beschränkt.
