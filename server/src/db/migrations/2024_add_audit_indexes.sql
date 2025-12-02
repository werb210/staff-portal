CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs (created_at);
