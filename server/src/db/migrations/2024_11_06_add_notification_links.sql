ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS application_id uuid,
  ADD COLUMN IF NOT EXISTS contact_id uuid;
