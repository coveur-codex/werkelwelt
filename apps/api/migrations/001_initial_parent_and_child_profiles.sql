CREATE TABLE parent_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_account_id uuid NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  birth_year integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT child_profiles_birth_year_reasonable CHECK (birth_year IS NULL OR birth_year BETWEEN 2000 AND 2100)
);

CREATE INDEX child_profiles_parent_account_id_idx ON child_profiles(parent_account_id);
