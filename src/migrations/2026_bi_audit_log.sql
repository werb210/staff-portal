CREATE TABLE IF NOT EXISTS bi_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  silo VARCHAR(10) NOT NULL DEFAULT 'BI',
  action VARCHAR(150) NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
