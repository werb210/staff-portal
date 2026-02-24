ALTER TABLE applications
ALTER COLUMN silo SET NOT NULL;

ALTER TABLE commissions
ALTER COLUMN silo SET NOT NULL;

ALTER TABLE documents
ALTER COLUMN silo SET NOT NULL;

ALTER TABLE referrers
ALTER COLUMN silo SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_silo
ON applications (silo);

CREATE INDEX IF NOT EXISTS idx_documents_silo
ON documents (silo);
