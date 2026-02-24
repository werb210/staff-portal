ALTER TABLE applications
ADD COLUMN IF NOT EXISTS underwriting_score INTEGER DEFAULT 0;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS underwriting_risk_level VARCHAR(20);
