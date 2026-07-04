/** Unique identifier shared by domain objects. */
export type EntityId = string;

/** Parent account for later authentication and child profile management. */
export interface ParentAccount {
  id: EntityId;
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

/** Child profile owned by a parent account; children do not need their own email address. */
export interface ChildProfile {
  id: EntityId;
  parentAccountId: EntityId;
  displayName: string;
  birthYear?: number;
  createdAt: string;
  updatedAt: string;
}

/** Rich progression state for a skill beyond a simple correct/incorrect flag. */
export type SkillStateStage =
  | "unseen"
  | "demo_seen"
  | "guided"
  | "with_help"
  | "independent_with_material"
  | "independent_without_material"
  | "stable"
  | "paper_transfer";

/** Current state of one child profile for one skill. */
export interface SkillState {
  id: EntityId;
  childProfileId: EntityId;
  skillKey: string;
  stage: SkillStateStage;
  updatedAt: string;
}

/** A bounded learning session for one child profile. */
export interface LearningSession {
  id: EntityId;
  childProfileId: EntityId;
  startedAt: string;
  endedAt?: string;
  mode?: "practice" | "guided" | "review" | "paper_transfer";
}

/** Event names for granular learning telemetry, including partial successes. */
export type LearningEventType =
  | "correct_partial_step"
  | "help_requested"
  | "demo_requested"
  | "repair_step_completed"
  | "paper_transfer_attempted";

/** Fine-grained event emitted during a learning session. */
export interface LearningEvent {
  id: EntityId;
  sessionId: EntityId;
  childProfileId: EntityId;
  skillKey: string;
  type: LearningEventType;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

/** Tracks how much help was used for a skill or task attempt. */
export interface HelpUsage {
  requestedCount: number;
  lastRequestedAt?: string;
  helpTypes?: Array<"hint" | "step" | "explanation" | "material">;
}

/** Tracks demo usage separately from help usage for didactic analysis. */
export interface DemoUsage {
  requestedCount: number;
  lastRequestedAt?: string;
  demoKeys?: string[];
}

/** Reward event assigned after meaningful learning progress. */
export interface RewardEvent {
  id: EntityId;
  childProfileId: EntityId;
  sessionId?: EntityId;
  rewardKey: string;
  reason: string;
  awardedAt: string;
}

/** Later paper-based transfer task linked to a child profile and skill. */
export interface PaperTransferTask {
  id: EntityId;
  childProfileId: EntityId;
  skillKey: string;
  status: "assigned" | "printed" | "attempted" | "reviewed";
  assignedAt: string;
  reviewedAt?: string;
}
