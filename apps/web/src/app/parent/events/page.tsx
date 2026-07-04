"use client";

import { useEffect, useState } from "react";
import type { AdditionLearningEvent } from "@werkelwelt/types";
import { listLearningEvents, summarizeLearningEvents } from "../../../lib/learning-events";

export default function ParentEventsPage() {
  const [events, setEvents] = useState<AdditionLearningEvent[]>([]);
  useEffect(() => { const load=()=>setEvents(listLearningEvents()); load(); window.addEventListener("werkelwelt-learning-events", load); return () => window.removeEventListener("werkelwelt-learning-events", load); }, []);
  const summary = summarizeLearningEvents(events);
  return <main className="page-shell learning-shell"><section className="hero compact"><p className="eyebrow">Elternbereich</p><h1>Addition mit Übertrag</h1><p className="subtitle">Einfache Übersicht für das Mock-Kind.</p></section><section className="work-card"><h2>Heute</h2><ul className="summary-list"><li>{summary.started} Aufgaben gestartet</li><li>{summary.completed} Aufgaben abgeschlossen</li><li>{summary.correctSteps} richtige Teilschritte</li><li>{summary.help} Hilfen genutzt</li><li>{summary.repairs} Bündel-Reparaturen abgeschlossen</li></ul><h3>Letzte Aufgaben</h3><p>{summary.recentTasks.length ? summary.recentTasks.join(", ") : "Noch keine Aufgaben bearbeitet."}</p><h3>Beobachtung</h3><p>{summary.help > 1 ? "Der Übertrag wurde mehrfach mit Hilfe gelöst." : "Es liegen noch wenige Ereignisse vor. Nach ein paar Aufgaben wird die Einschätzung genauer."}</p></section><section className="work-card"><h2>Letzte Lernereignisse</h2><div className="event-list">{events.slice(0,20).map(event=><article key={event.id} className="event-row"><b>{event.event_type}</b><span>{new Date(event.created_at).toLocaleString("de-DE")}</span><span>{event.task_left !== undefined ? `${event.task_left} + ${event.task_right}` : ""}</span><span>{event.step ?? event.repair_type ?? ""}</span></article>)}</div></section></main>;
}
