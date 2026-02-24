ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_crm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_crm_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS silo_isolation_policy ON applications;
CREATE POLICY silo_isolation_policy ON applications
USING (silo = current_setting('app.current_silo', true))
WITH CHECK (silo = current_setting('app.current_silo', true));

DROP POLICY IF EXISTS silo_isolation_policy_docs ON documents;
CREATE POLICY silo_isolation_policy_docs ON documents
USING (silo = current_setting('app.current_silo', true))
WITH CHECK (silo = current_setting('app.current_silo', true));

DROP POLICY IF EXISTS silo_isolation_policy_commissions ON commissions;
CREATE POLICY silo_isolation_policy_commissions ON commissions
USING (silo = current_setting('app.current_silo', true))
WITH CHECK (silo = current_setting('app.current_silo', true));

DROP POLICY IF EXISTS silo_isolation_policy_referrers ON referrers;
CREATE POLICY silo_isolation_policy_referrers ON referrers
USING (silo = current_setting('app.current_silo', true))
WITH CHECK (silo = current_setting('app.current_silo', true));

DROP POLICY IF EXISTS silo_isolation_policy_lenders ON lenders;
CREATE POLICY silo_isolation_policy_lenders ON lenders
USING (silo = current_setting('app.current_silo', true))
WITH CHECK (silo = current_setting('app.current_silo', true));

DROP POLICY IF EXISTS silo_isolation_policy_crm_events ON bi_crm_events;
CREATE POLICY silo_isolation_policy_crm_events ON bi_crm_events
USING (silo = 'BI')
WITH CHECK (silo = 'BI');

DROP POLICY IF EXISTS silo_isolation_policy_crm_activities ON bi_crm_activities;
CREATE POLICY silo_isolation_policy_crm_activities ON bi_crm_activities
USING (silo = 'BI')
WITH CHECK (silo = 'BI');

ALTER TABLE applications FORCE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
ALTER TABLE commissions FORCE ROW LEVEL SECURITY;
ALTER TABLE referrers FORCE ROW LEVEL SECURITY;
ALTER TABLE lenders FORCE ROW LEVEL SECURITY;
ALTER TABLE bi_crm_events FORCE ROW LEVEL SECURITY;
ALTER TABLE bi_crm_activities FORCE ROW LEVEL SECURITY;
