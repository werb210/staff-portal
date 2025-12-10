# Full Client Flow E2E Tests

## Coverage
- Step 1 KYC full cycle
- Step 2 recommendation engine behavior
- Step 3 dynamic business questions
- Step 4 dynamic applicant questions
- Step 5 required docs logic
- Offline upload behavior
- AI chatbot tests
- Talk-to-human path tests
- Report-issue path tests
- Submit → SignNow redirect flow
- Reset application test
- Token corruption recovery
- Double submission prevention

## Test Cases

### Step 1: KYC Full Cycle
1. Complete identity capture with ID upload and selfie; verify liveness and fraud scores recorded.
2. Validate address and DOB collection with format checks and error prompts.
3. Confirm KYC status updates from `pending` → `approved` or `review` with audit trail.

### Step 2: Recommendation Engine
1. Provide business data and confirm recommendations adapt to industry and revenue inputs.
2. Validate recommended products show rationale and match score per lender.
3. Verify edge cases: low revenue, new business, and high-risk industries.

### Step 3: Dynamic Business Questions
1. Progress through business questions; confirm branching per prior answers (e.g., province, structure).
2. Validate required field prompts and inline guidance.
3. Ensure autosave captures answers on step navigation.

### Step 4: Dynamic Applicant Questions
1. Complete applicant questions with multiple principals; confirm conditional fields appear as expected.
2. Validate SIN/SSN masking and validation rules.
3. Ensure autosave and back-navigation retain data.

### Step 5: Required Docs Logic
1. Verify required docs list reflects business/applicant inputs and lender rules.
2. Check upload flows: single file, multi-file, and type validation.
3. Confirm required docs satisfied gate before submission.

### Offline Upload Behavior
1. Simulate network loss during upload; confirm queued uploads retry when connection restores.
2. Ensure user messaging indicates offline state and retry progress.

### AI Chatbot Tests
1. Start chatbot and submit common questions; expect AI responses and resource links.
2. Validate context retention across steps and applications.

### Talk-to-Human Path
1. Request human support; confirm handoff event, queue placement, and expected wait time display.
2. Validate notification when agent joins and chat transcript persistence.

### Report-Issue Path
1. Submit issue report; ensure ticket ID returned and status available in activity log.
2. Confirm updates propagate to staff portal CRM timeline.

### Submit → SignNow Redirect Flow
1. Complete application submission; verify redirect to SignNow with envelope context.
2. Confirm signer details prefilled and return URL points back to client app.

### Reset Application
1. Trigger reset; validate data cleared, tokens revoked, and user returned to step 1.
2. Ensure audit log records reset reason and actor.

### Token Corruption Recovery
1. Corrupt stored token; confirm app prompts re-authentication and preserves unsaved data.
2. Validate new token refreshes session without duplicating submissions.

### Double Submission Prevention
1. Attempt rapid consecutive submissions; expect idempotency response and single record creation.
2. Confirm UI displays success only once and prevents duplicate document uploads.
