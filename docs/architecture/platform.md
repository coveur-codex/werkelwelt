# Werkelwelt Plattformarchitektur

Werkelwelt wird als Plattformbasis für eine Web-/PWA-Anwendung aufgebaut. Das MVP konzentriert sich auf stabile technische Grundlagen, gemeinsame Datenmodelle und deterministische Prüf- und Inhaltslogik. Es enthält noch kein Deployment, keine Container-Registry-Automatisierung und keine echte adaptive Lernlogik.

## Zielbild

Die Plattform besteht aus klar getrennten Anwendungen, Services und wiederverwendbaren Paketen:

- **web**: Kind- und Elternoberfläche als Web-App/PWA.
- **api**: zentrale Backend-API für Authentifizierung, Profile, Lernstände, Inhalte und Integrationen.
- **worker**: Hintergrundjobs für Aufgaben, die nicht im Request/Response-Pfad laufen sollen.
- **postgres**: relationale, transaktionale Datenhaltung.
- **redis**: spätere Queue- und Cache-Komponente.
- **minio**: lokale, S3-kompatible Dateiablage für Fotos, Exporte und Spiel-/Lernassets.
- **packages/math-engine**: deterministische mathematische Rechen- und Prüfungslogik.
- **packages/skill-graph**: Skillstruktur und Abhängigkeiten zwischen Kompetenzen.
- **packages/content-model**: Aufgaben- und Inhaltsmodelle.
- **packages/types**: gemeinsame TypeScript-Typen für Apps, Services und Pakete.

## Komponenten

### web

Die Web-App stellt zwei Perspektiven bereit:

1. **Kindoberfläche** für altersgerechte Aufgaben, Fortschritt und spielerische Interaktion.
2. **Elternoberfläche** für Profile, Einstellungen, Fortschrittsübersichten und Freigaben.

Die Oberfläche wird als Web/PWA geplant, weil sie ohne App-Store-Verteilung nutzbar ist, auf Desktop, Tablet und Smartphone funktioniert und später Offline-/Installationsfunktionen ergänzen kann. Für das Plattform-MVP bleibt der Fokus auf Struktur, Navigation und Anbindung an die API; ausgefeilte Spiellogik oder echte adaptive Lernpfade sind nicht Teil dieser Basis.

### api

Die API ist die zentrale Backend-Schicht. Sie kapselt Datenzugriffe, validiert Eingaben und stellt konsistente Schnittstellen für Web-Frontend, Worker und spätere Integrationen bereit. Dadurch bleibt Geschäftslogik an einer Stelle nachvollziehbar, statt direkt im Frontend oder in einzelnen Jobs verteilt zu werden.

### worker

Der Worker übernimmt Hintergrundverarbeitung, zum Beispiel:

- Generierung von Exporten und Berichten,
- Verarbeitung hochgeladener Fotos oder Assets,
- spätere Lernstands-Zusammenfassungen,
- asynchrone Wartungs- und Importaufgaben.

Solche Aufgaben werden getrennt vom API-Prozess betrieben, damit langsame oder wiederholbare Jobs nicht die Antwortzeiten der API beeinträchtigen.

### postgres

Postgres ist die primäre relationale Datenbank. Sie eignet sich für strukturierte Plattformdaten wie Nutzer, Kinderprofile, Aufgaben, Skills, Lernereignisse und Berechtigungen. Relationale Integrität ist für diese Kernobjekte wichtiger als eine flexible, aber schwächer strukturierte Ablage.

### redis

Redis ist als spätere Infrastruktur für Queues, Caches und kurzlebige Zustände vorgesehen. Im Plattform-MVP soll Redis vorbereitet, aber nicht für komplexe Lernentscheidungen missbraucht werden. Persistente Plattformdaten bleiben in Postgres.

### minio

Minio dient lokal als S3-kompatibler Objektspeicher. Dort sollen Fotos, Exporte und Assets abgelegt werden, statt große Binärdateien in Postgres oder im Git-Repository zu speichern. Diese Trennung erleichtert Backups, spätere Migration zu einem Cloud-Objektspeicher und eine klare Verwaltung von Nutzerdaten und Spielassets.

## Gemeinsame Pakete

### packages/math-engine

Die mathematische Prüfung muss deterministisch im `math-engine`-Paket implementiert werden. Ein LLM darf nicht entscheiden, ob eine mathematische Antwort richtig oder falsch ist.

Gründe für diese Architekturentscheidung:

- Mathematische Korrektheit muss reproduzierbar sein.
- Bewertungen müssen testbar und versionierbar bleiben.
- Kinder, Eltern und Betreiber brauchen nachvollziehbare Ergebnisse.
- LLM-Ausgaben können variieren und eignen sich nicht als alleinige Bewertungsinstanz.

Ein LLM kann später unterstützende Texte, Hinweise oder Varianten vorschlagen. Die finale Prüfung mathematischer Antworten bleibt aber regelbasiert, deterministisch und automatisiert testbar.

### packages/skill-graph

Der Skill-Graph beschreibt Kompetenzen, Abhängigkeiten und mögliche Lernpfade. Im MVP dient er als strukturierte Grundlage, nicht als vollständige adaptive Lernsteuerung. So kann die Plattform Inhalte und Fortschritt einordnen, ohne bereits komplexe Personalisierung zu versprechen.

### packages/content-model

Das Content-Model definiert Aufgaben, Antwortformate, Metadaten, Schwierigkeitsinformationen und Beziehungen zu Skills. Es trennt Inhaltsstruktur von UI und Datenbankdetails. Dadurch können Aufgaben später aus unterschiedlichen Quellen erzeugt, importiert oder kuratiert werden.

### packages/types

Gemeinsame Typen verhindern doppelte, voneinander abweichende Schnittstellendefinitionen in Web, API, Worker und Paketen. Das Paket bildet die technische Grundlage für konsistente DTOs, Domänenobjekte und Integrationsverträge.

## Warum getrennte Services?

Web, API und Worker werden getrennt, weil sie unterschiedliche Verantwortlichkeiten und Betriebsprofile haben:

- Die Web-App optimiert Darstellung und Interaktion.
- Die API optimiert konsistente Schnittstellen und synchrone Anfragen.
- Der Worker optimiert asynchrone, wiederholbare und potenziell langsamere Verarbeitung.

Diese Trennung hält das MVP verständlich und ermöglicht später unabhängige Skalierung, klarere Fehleranalyse und einfachere Deployment-Grenzen. Gleichzeitig bleibt das Repository als Monorepo organisiert, damit gemeinsame Pakete und Typen einfach zusammen entwickelt werden können.

## Warum keine echte Lernlogik im Plattform-MVP?

Das Plattform-MVP soll zuerst stabile Grundlagen liefern: Datenmodell, Services, Workspaces, deterministische Prüfungen, Inhaltstypen und Infrastruktur. Echte Lernlogik wie adaptive Empfehlungen, langfristige Wissensmodellierung oder personalisierte Sequenzierung wird bewusst zurückgestellt.

Das reduziert Produkt- und Technikrisiko. Erst wenn Inhalte, Skills, Ereignisse und mathematische Prüfungen zuverlässig funktionieren, kann darauf eine sinnvolle adaptive Lernlogik aufgebaut werden.

## Warum Spielassets getrennt verwalten?

Spielassets wie Bilder, Animationen, Audiodateien, Belohnungen oder exportierte Dateien unterscheiden sich stark von Quellcode und relationalen Daten. Sie können groß sein, häufig ausgetauscht werden und eigene Lizenz- oder Freigabeprozesse benötigen.

Deshalb werden Assets über Minio beziehungsweise später einen kompatiblen Objektspeicher verwaltet. Das hält das Git-Repository schlank, vermeidet große Binärdateien in der Datenbank und macht spätere CDN-, Backup- und Rechtekonzepte einfacher.

## MVP-Grenzen

Nicht Teil dieser Plattformbasis sind:

- automatisches Deployment,
- Pushes in eine Container Registry,
- vollständige adaptive Lernlogik,
- LLM-basierte mathematische Bewertung,
- produktionsreife Asset-Pipeline.

Der Fokus bleibt auf einer belastbaren, verständlichen Plattformarchitektur, die spätere Produktfunktionen sauber tragen kann.
