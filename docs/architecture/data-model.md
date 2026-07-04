# Datenmodell-Vorbereitung

Die erste Modellierung trennt Elternkonten klar von Kindprofilen. Ein `parent_accounts`-Datensatz repräsentiert das spätere Login- und Verwaltungskonto eines Erwachsenen. Ein `child_profiles`-Datensatz gehört über `parent_account_id` zu einem Elternkonto und benötigt bewusst keine eigene E-Mail-Adresse.

## Migrationen

Die API verwendet `node-pg-migrate` mit SQL-Migrationsdateien in `apps/api/migrations`.

Lokal im Compose-Netzwerk können Migrationen so ausgeführt werden:

```bash
docker compose -f compose.dev.yml run --rm api npm run db:migrate
```

Außerhalb von Docker muss `DATABASE_URL` auf eine erreichbare PostgreSQL-Datenbank zeigen:

```bash
DATABASE_URL=postgres://werkelwelt:werkelwelt_dev_password@localhost:5432/werkelwelt npm --workspace @werkelwelt/api run db:migrate
```

## Initiale Tabellen

### parent_accounts

- `id`: UUID-Primärschlüssel.
- `email`: eindeutige E-Mail-Adresse des Elternkontos für spätere Authentifizierung.
- `display_name`: optionaler Anzeigename.
- `created_at`, `updated_at`: technische Zeitstempel.

### child_profiles

- `id`: UUID-Primärschlüssel.
- `parent_account_id`: Pflichtreferenz auf `parent_accounts` mit Cascade Delete.
- `display_name`: Anzeigename des Kindes.
- `birth_year`: optionales Geburtsjahr für spätere altersgerechte Inhalte.
- `created_at`, `updated_at`: technische Zeitstempel.

## Entwurf für spätere Tabellen

- `learning_sessions`: bündelt Lernaktivität eines Kindprofils in einer Sitzung.
- `learning_events`: speichert feingranulare Ereignisse wie Teilschritte, Hilfe- oder Worked-Example-Anfragen.
- `skill_states`: hält den aktuellen Kompetenzzustand pro Kindprofil und Fähigkeit.
- `rewards`: protokolliert Belohnungsereignisse ohne pädagogische Kernlogik zu vermischen.
- `paper_transfer_tasks`: dokumentiert spätere Transferaufgaben auf Papier.

Authentifizierung, Passwörter, Tokens und produktive Rechteverwaltung werden noch nicht implementiert.
