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
  | "worked_example_seen"
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
  mode?: "worked_example" | "guided_mode" | "practice_mode" | "review" | "paper_transfer";
}

/** Event names for granular learning telemetry, including partial successes. */
export type LearningEventType =
  | "correct_partial_step"
  | "help_requested"
  | "worked_example_requested"
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

/** Tracks worked-example usage separately from help usage for didactic analysis. */
export interface WorkedExampleUsage {
  requestedCount: number;
  lastRequestedAt?: string;
  workedExampleKeys?: string[];
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

/** Operation names used by MVP learning events. */
export type Operation = "addition";

/** MVP modes for addition with carrying. */
export type LearningMode = "worked_example" | "guided_mode" | "practice_mode";

/** Granular MVP learning telemetry event names. */
export type AdditionLearningEventType =
  | "task_started"
  | "mode_selected"
  | "worked_example_started"
  | "worked_example_step_viewed"
  | "worked_example_completed"
  | "guided_started"
  | "practice_started"
  | "guided_step_answered"
  | "practice_checked"
  | "correct_partial_step"
  | "incorrect_partial_step"
  | "help_requested"
  | "repair_started"
  | "repair_step_completed"
  | "task_completed"
  | "task_abandoned"
  | "session_mood_reported"
  | "difficulty_requested"
  | "difficulty_applied";

/** Persistable MVP learning event shape; repository storage can later move to PostgreSQL unchanged. */
export interface AdditionLearningEvent {
  id: EntityId;
  child_profile_id: EntityId;
  created_at: string;
  operation: Operation;
  mode?: LearningMode;
  event_type: AdditionLearningEventType;
  step?: string;
  task_left?: number;
  task_right?: number;
  expected_value?: number;
  actual_value?: number | null;
  help_level?: number;
  repair_type?: "bundling_ones_to_tens" | "carry_to_tens_column";
  difficulty_class?: string;
  mood?: "easy" | "ok" | "hard" | "too_much";
  requested_direction?: "easier" | "similar" | "harder";
  current_difficulty_class?: string;
  applied_difficulty_class?: string;
  reason?: string;
  metadata_json?: Record<string, unknown>;
}
