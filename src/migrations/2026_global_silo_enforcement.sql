ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;

ALTER TABLE applications FORCE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
ALTER TABLE commissions FORCE ROW LEVEL SECURITY;
ALTER TABLE referrers FORCE ROW LEVEL SECURITY;
ALTER TABLE lenders FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS silo_policy_applications ON applications;
CREATE POLICY silo_policy_applications
ON applications
USING (silo = current_setting('app.current_silo'))
WITH CHECK (silo = current_setting('app.current_silo'));

DROP POLICY IF EXISTS silo_policy_documents ON documents;
CREATE POLICY silo_policy_documents
ON documents
USING (silo = current_setting('app.current_silo'))
WITH CHECK (silo = current_setting('app.current_silo'));

DROP POLICY IF EXISTS silo_policy_commissions ON commissions;
CREATE POLICY silo_policy_commissions
ON commissions
USING (silo = current_setting('app.current_silo'))
WITH CHECK (silo = current_setting('app.current_silo'));

DROP POLICY IF EXISTS silo_policy_referrers ON referrers;
CREATE POLICY silo_policy_referrers
ON referrers
USING (silo = current_setting('app.current_silo'))
WITH CHECK (silo = current_setting('app.current_silo'));

DROP POLICY IF EXISTS silo_policy_lenders ON lenders;
CREATE POLICY silo_policy_lenders
ON lenders
USING (silo = current_setting('app.current_silo'))
WITH CHECK (silo = current_setting('app.current_silo'));

ALTER TABLE applications ALTER COLUMN silo SET NOT NULL;
ALTER TABLE documents ALTER COLUMN silo SET NOT NULL;
ALTER TABLE commissions ALTER COLUMN silo SET NOT NULL;
ALTER TABLE referrers ALTER COLUMN silo SET NOT NULL;
ALTER TABLE lenders ALTER COLUMN silo SET NOT NULL;

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_silo_valid;
ALTER TABLE applications ADD CONSTRAINT applications_silo_valid CHECK (silo IN ('BF', 'BI', 'SLF'));

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_silo_valid;
ALTER TABLE documents ADD CONSTRAINT documents_silo_valid CHECK (silo IN ('BF', 'BI', 'SLF'));

ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_silo_valid;
ALTER TABLE commissions ADD CONSTRAINT commissions_silo_valid CHECK (silo IN ('BF', 'BI', 'SLF'));

ALTER TABLE referrers DROP CONSTRAINT IF EXISTS referrers_silo_valid;
ALTER TABLE referrers ADD CONSTRAINT referrers_silo_valid CHECK (silo IN ('BF', 'BI', 'SLF'));

ALTER TABLE lenders DROP CONSTRAINT IF EXISTS lenders_silo_valid;
ALTER TABLE lenders ADD CONSTRAINT lenders_silo_valid CHECK (silo IN ('BF', 'BI', 'SLF'));
