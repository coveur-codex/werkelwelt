CREATE TABLE skill_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_key text NOT NULL,
  status text NOT NULL DEFAULT 'unseen',
  evidence_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  help_count integer NOT NULL DEFAULT 0,
  repair_count integer NOT NULL DEFAULT 0,
  last_practiced_at timestamptz,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_profile_id, skill_key)
);

CREATE TABLE learning_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  mood text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES learning_sessions(id) ON DELETE SET NULL,
  operation text NOT NULL DEFAULT 'addition',
  mode text,
  event_type text NOT NULL,
  step text,
  task_left integer,
  task_right integer,
  difficulty_class text,
  expected_value integer,
  actual_value integer,
  help_level integer,
  repair_type text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX skill_states_child_profile_id_idx ON skill_states(child_profile_id);
CREATE INDEX learning_sessions_child_profile_id_idx ON learning_sessions(child_profile_id);
CREATE INDEX learning_events_child_profile_id_created_at_idx ON learning_events(child_profile_id, created_at DESC);
