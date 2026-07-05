"use client";

import { calculateRewardEventsForLearningEvent, sumRewardPoints, type RewardEvent as EngineRewardEvent } from "@werkelwelt/math-engine";
import type { AdditionLearningEvent, AdditionLearningEventType, LearningMode } from "@werkelwelt/types";

const EVENTS_KEY = "werkelwelt.learning_events.v2";
const FAMILY_KEY = "werkelwelt.family.v1";
const SESSIONS_KEY = "werkelwelt.learning_sessions.v1";
const REWARDS_KEY = "werkelwelt.reward_events.v1";
export const MOCK_PARENT_ACCOUNT_ID = "local-test-parent";
export const DEFAULT_CHILD_PROFILE_ID = "local-test-child";

export type SessionMood = "easy" | "ok" | "hard" | "too_much";
export type LearningSession = { id: string; childProfileId: string; operation: "addition"; status: "active" | "completed" | "abandoned"; plannedTaskCount: number; completedTaskCount: number; startedAt: string; completedAt?: string | undefined; mood?: SessionMood | undefined; metadata?: Record<string, unknown> | undefined };
export type ParentAccount = { id: string; email?: string; displayName: string; createdAt: string };
export type ChildProfile = { id: string; parentAccountId: string; displayName: string; avatarKey?: string; createdAt: string; updatedAt?: string; isActive: boolean; currentPoints: number };
export type RewardEvent = EngineRewardEvent;
export interface FamilyState { parent: ParentAccount; children: ChildProfile[]; activeChildProfileId?: string; }

export interface RecordLearningEventInput {
  childProfileId?: string | undefined; sessionId?: string | undefined; mode?: LearningMode; event_type: AdditionLearningEventType | "session_started" | "session_completed" | "points_awarded"; step?: string; task_left?: number; task_right?: number; expected_value?: number; actual_value?: number | null; help_level?: number; repair_type?: "bundling_ones_to_tens" | "carry_to_tens_column"; difficulty_class?: string; mood?: SessionMood | undefined; requested_direction?: "easier" | "similar" | "harder"; current_difficulty_class?: string; applied_difficulty_class?: string; reason?: string; metadata_json?: Record<string, unknown>;
}

function readJson<T>(key: string, fallback: T): T { if (typeof window === "undefined") return fallback; try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function writeJson<T>(key: string, value: T) { window.localStorage.setItem(key, JSON.stringify(value)); }
function emit() { window.dispatchEvent(new Event("werkelwelt-learning-events")); window.dispatchEvent(new Event("werkelwelt-family")); }

export function getFamilyState(): FamilyState {
  const seeded: FamilyState = { parent: { id: MOCK_PARENT_ACCOUNT_ID, displayName: "Test-Elternkonto", createdAt: "2026-01-01T00:00:00.000Z" }, children: [], activeChildProfileId: DEFAULT_CHILD_PROFILE_ID };
  const state = readJson<FamilyState>(FAMILY_KEY, seeded);
  const rewards = listRewardEvents();
  const children = state.children.map((child) => ({ ...child, isActive: child.isActive ?? true, currentPoints: sumRewardPoints(rewards.filter((reward) => reward.childProfileId === child.id)) }));
  return { ...state, children };
}
export function saveFamilyState(state: FamilyState) { writeJson(FAMILY_KEY, state); emit(); }
export function addChildProfile(displayName: string, parentAccountId?: string): ChildProfile { const state = getFamilyState(); const now = new Date().toISOString(); const child: ChildProfile = { id: crypto.randomUUID(), parentAccountId: parentAccountId ?? state.parent.id, displayName, createdAt: now, updatedAt: now, isActive: true, currentPoints: 0 }; saveFamilyState({ ...state, children: [...state.children, child], activeChildProfileId: child.id }); return child; }
export function updateChildProfile(childProfileId: string, input: { displayName?: string; isActive?: boolean }) { const state = getFamilyState(); const children = state.children.map((child) => child.id === childProfileId ? { ...child, ...input, updatedAt: new Date().toISOString() } : child); saveFamilyState({ ...state, children }); }
export function getAllChildren() { return getFamilyState().children; }
export function getChildrenForParent(parentAccountId: string) { return getFamilyState().children.filter((child) => child.parentAccountId === parentAccountId && child.isActive !== false); }
export function selectChildProfile(childProfileId: string) { const state = getFamilyState(); saveFamilyState({ ...state, activeChildProfileId: childProfileId }); }
export function getActiveChildProfile() { const state = getFamilyState(); return state.children.find((child) => child.id === state.activeChildProfileId && child.isActive !== false); }

export function listLearningSessions(): LearningSession[] { return readJson<LearningSession[]>(SESSIONS_KEY, []); }
export function saveLearningSession(session: LearningSession) { const sessions = [session, ...listLearningSessions().filter((item) => item.id !== session.id)].slice(0, 100); writeJson(SESSIONS_KEY, sessions); emit(); }
export function startLearningSession(childProfileId: string, plannedTaskCount = 3): LearningSession { const session: LearningSession = { id: crypto.randomUUID(), childProfileId, operation: "addition", status: "active", plannedTaskCount, completedTaskCount: 0, startedAt: new Date().toISOString() }; saveLearningSession(session); recordLearningEvent({ childProfileId, sessionId: session.id, event_type: "session_started" }); return session; }
export function completeLearningSession(sessionId: string, mood?: SessionMood) { const session = listLearningSessions().find((item) => item.id === sessionId); if (!session) return; const next: LearningSession = { ...session, status: "completed", completedAt: new Date().toISOString() }; const finalMood = mood ?? session.mood; if (finalMood) next.mood = finalMood; saveLearningSession(next); recordLearningEvent({ childProfileId: session.childProfileId, sessionId, event_type: "session_completed", ...(mood ? { mood } : {}) }); }
export function updateSessionAfterTask(sessionId: string) { const session = listLearningSessions().find((item) => item.id === sessionId); if (!session) return; const completedTaskCount = Math.min(session.plannedTaskCount, session.completedTaskCount + 1); const next: LearningSession = { ...session, completedTaskCount, status: completedTaskCount >= session.plannedTaskCount ? "completed" : session.status }; if (completedTaskCount >= session.plannedTaskCount) next.completedAt = new Date().toISOString(); saveLearningSession(next); }

export function listLearningEvents(): AdditionLearningEvent[] { return readJson<AdditionLearningEvent[]>(EVENTS_KEY, []); }
export function listRewardEvents(): RewardEvent[] { return readJson<RewardEvent[]>(REWARDS_KEY, []); }
export function recordLearningEvent(input: RecordLearningEventInput): AdditionLearningEvent {
  const active = getActiveChildProfile(); const childProfileId = input.childProfileId ?? active?.id; if (!childProfileId) throw new Error("active_child_required");
  const event = { id: crypto.randomUUID(), child_profile_id: childProfileId, session_id: input.sessionId, created_at: new Date().toISOString(), operation: "addition", ...input } as AdditionLearningEvent;
  writeJson(EVENTS_KEY, [event, ...listLearningEvents()].slice(0, 500));
  const rewards = calculateRewardEventsForLearningEvent(event as any);
  if (rewards.length) writeJson(REWARDS_KEY, [...rewards, ...listRewardEvents()].slice(0, 1000));
  emit(); return event;
}

export function summarizeLearningEvents(events: AdditionLearningEvent[], rewards: RewardEvent[] = listRewardEvents()) {
  return { started: events.filter((event) => event.event_type === "task_started").length, completed: events.filter((event) => event.event_type === "task_completed").length, correctSteps: events.filter((event) => event.event_type === "correct_partial_step").length, help: events.filter((event) => event.event_type === "help_requested").length, repairs: events.filter((event) => event.event_type === "repair_step_completed").length, mood: events.find((event) => event.event_type === "session_mood_reported")?.mood, frequentDifficulty: mostFrequent(events.map((event) => event.difficulty_class).filter(Boolean) as string[]), recentTasks: Array.from(new Set(events.filter((event) => event.task_left !== undefined && event.task_right !== undefined).map((event) => `${event.task_left} + ${event.task_right}`))).slice(0, 5), points: sumRewardPoints(rewards), difficultyRequests: { easier: events.filter((event) => event.event_type === "difficulty_requested" && event.requested_direction === "easier").length, similar: events.filter((event) => event.event_type === "difficulty_requested" && event.requested_direction === "similar").length, harder: events.filter((event) => event.event_type === "difficulty_requested" && event.requested_direction === "harder").length }, protectedHarder: events.filter((event) => event.event_type === "difficulty_applied" && event.requested_direction === "harder" && event.reason === "kept_similar_due_to_recent_help_or_mood").length };
}
function mostFrequent(values: string[]): string | undefined { const counts = new Map<string, number>(); for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1); return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]; }
