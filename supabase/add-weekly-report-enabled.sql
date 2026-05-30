ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean NOT NULL DEFAULT true;
