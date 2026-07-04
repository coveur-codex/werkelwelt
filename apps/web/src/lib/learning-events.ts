"use client";

import type { AdditionLearningEvent, AdditionLearningEventType, LearningMode } from "@werkelwelt/types";

const STORAGE_KEY = "werkelwelt.learning_events.v1";
export const MOCK_CHILD_PROFILE_ID = "mock-child-plus-workshop";

export interface RecordLearningEventInput {
  mode?: LearningMode;
  event_type: AdditionLearningEventType;
  step?: string;
  task_left?: number;
  task_right?: number;
  expected_value?: number;
  actual_value?: number | null;
  help_level?: number;
  repair_type?: "bundling_ones_to_tens" | "carry_to_tens_column";
  metadata_json?: Record<string, unknown>;
}

export function listLearningEvents(): AdditionLearningEvent[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const events = JSON.parse(raw) as AdditionLearningEvent[];
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

export function recordLearningEvent(input: RecordLearningEventInput): AdditionLearningEvent {
  const event: AdditionLearningEvent = {
    id: crypto.randomUUID(),
    child_profile_id: MOCK_CHILD_PROFILE_ID,
    created_at: new Date().toISOString(),
    operation: "addition",
    ...input,
  };
  const events = [event, ...listLearningEvents()].slice(0, 200);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("werkelwelt-learning-events"));
  return event;
}

export function summarizeLearningEvents(events: AdditionLearningEvent[]) {
  return {
    started: events.filter((event) => event.event_type === "task_started").length,
    completed: events.filter((event) => event.event_type === "task_completed").length,
    correctSteps: events.filter((event) => event.event_type === "correct_partial_step").length,
    help: events.filter((event) => event.event_type === "help_requested").length,
    repairs: events.filter((event) => event.event_type === "repair_step_completed").length,
    recentTasks: Array.from(new Set(events.filter((event) => event.task_left !== undefined && event.task_right !== undefined).map((event) => `${event.task_left} + ${event.task_right}`))).slice(0, 5),
  };
}
