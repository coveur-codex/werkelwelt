ALTER TABLE parent_accounts ALTER COLUMN email DROP NOT NULL;
ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS avatar_key text;
ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS current_points integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS learning_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  operation text NOT NULL DEFAULT 'addition',
  status text NOT NULL DEFAULT 'active',
  planned_task_count integer NOT NULL DEFAULT 3,
  completed_task_count integer NOT NULL DEFAULT 0,
  mood text,
  metadata_json jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT learning_sessions_operation_addition CHECK (operation = 'addition'),
  CONSTRAINT learning_sessions_status_check CHECK (status IN ('active', 'completed', 'abandoned')),
  CONSTRAINT learning_sessions_mood_check CHECK (mood IS NULL OR mood IN ('easy', 'ok', 'hard', 'too_much'))
);

ALTER TABLE addition_learning_events ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES learning_sessions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS reward_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES learning_sessions(id) ON DELETE SET NULL,
  learning_event_id uuid,
  reason text NOT NULL,
  points integer NOT NULL CHECK (points >= 0),
  metadata_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO parent_accounts (id, display_name, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test-Elternkonto', now(), now())
ON CONFLICT (id) DO NOTHING;
INSERT INTO child_profiles (id, parent_account_id, display_name, avatar_key)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Testkind', 'spark')
ON CONFLICT (id) DO NOTHING;
