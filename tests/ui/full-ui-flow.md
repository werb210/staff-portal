# Full UI Flow Tests

## Coverage
- Login & MFA validation
- Silo switching test (BF / BI / SLF)
- Dashboard render test
- Sales pipeline column tests
- Application card tab tests:
  - Application Data
  - Banking / Flinks
  - Financial Data
  - Documents
  - Notes conversation
  - Credit Summary PDF generation
  - Lenders table + quotas + match %
- Document preview & download
- Document accept/reject tests
- Communication Center tests
- CRM Contact tests (timeline, calls, SMS, email)
- Marketing Tab tests
- Lender Portal tests
- Settings page tests

## Test Cases

### Login & MFA Validation
1. Validate login form input rules and disabled state until required fields populated.
2. Confirm MFA challenge delivered (email/SMS/app) and acceptance updates auth token.
3. Verify lockout after consecutive failed attempts and audit log entry creation.

### Silo Switching (BF / BI / SLF)
1. Switch silo via header control; ensure global filters update and data reloads.
2. Confirm role permissions align per silo (pipeline visibility, lender access, marketing assets).
3. Validate silo state persists across page refresh and new tabs.

### Dashboard Rendering
1. Load dashboard and verify widgets for tasks, pipeline metrics, and alerts render without errors.
2. Confirm date filters adjust charts and underlying data requests.

### Sales Pipeline Columns
1. Validate columns for each stage are present and labeled correctly.
2. Drag-and-drop application cards between stages; ensure status updates and toast confirmation.
3. Confirm WIP limits and SLA indicators display per stage.

### Application Card Tabs
1. Open application card and verify all tabs render without console errors.
2. Application Data: ensure fields populate and edits respect validation rules.
3. Banking / Flinks: confirm linkage status, refresh tokens, and transaction tables render.
4. Financial Data: validate calculated metrics and guardrails for missing data.
5. Documents: ensure upload list, statuses, and preview modal function.
6. Notes conversation: post note and confirm real-time update plus timeline entry.
7. Credit Summary PDF: trigger generation and verify download availability with correct timestamp.
8. Lenders table: confirm quotas, match percentages, and sorting by fit score.

### Document Preview & Download
1. Open document preview modal; ensure image/PDF renders and navigation works.
2. Download file; confirm file name, size, and checksum match server response.

### Document Accept/Reject
1. Accept document and ensure status badge updates and timeline entry created.
2. Reject document with reason; verify status, notification, and re-upload prompt.

### Communication Center
1. Validate inbox, SMS, voice, and email tabs load and filter conversations by silo.
2. Send outbound SMS/email and confirm delivery status plus timeline logging.
3. Test call initiation and recording availability with playback controls.

### CRM Contacts
1. Verify contact list search, filters, and pagination.
2. Open contact detail; confirm timeline entries, call logs, SMS threads, and email threads render.
3. Create new contact and associate with application; validate saving and activity feed update.

### Marketing Tab
1. Ensure campaigns list renders; verify status chips and send counts.
2. Trigger campaign send/stop and confirm confirmation dialogs and audit log entries.
3. Validate analytics charts update on date range changes.

### Lender Portal
1. Confirm lender portal switch renders lender-specific dashboard and quotas.
2. Validate lender-specific document access, messaging, and status updates.

### Settings Page
1. Validate profile updates (name, phone, notification preferences) with success feedback.
2. Manage team permissions and roles; ensure changes reflected immediately.
3. Update integrations (Flinks, SignNow, telephony) and confirm connection tests succeed.
