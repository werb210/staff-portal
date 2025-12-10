# Full System Flow End-to-End Tests

## Coverage
- API health checks
- Application creation test
- Document upload → storage → DB record validation
- OCR trigger validation
- Banking analysis trigger validation
- Sales pipeline automation test
- Lender product retrieval test
- Send-to-lender test including payload format
- SignNow initiation test
- SignNow callback test
- Document re-mounting test
- CRM timeline entry creation for all events
- AI chatbot message routing tests
- Talk-to-human routing tests
- Report-an-issue routing tests

## Test Cases

### API Health Checks
1. Verify `/health` endpoint returns 200 with service and database indicators.
2. Confirm authentication gateway endpoints respond with expected version metadata.
3. Validate feature-flag and config endpoints are reachable for all silos (BF, BI, SLF).

### Application Creation
1. Create application payload via public API; assert 201 response and application ID.
2. Confirm application appears in database with correct silo, owner, and status `new`.
3. Validate webhook/event bus emits `application.created` event.

### Document Upload → Storage → DB Record Validation
1. Upload document to application using multipart request with signed URL.
2. Verify storage entry exists with correct ACL and path namespacing.
3. Assert database record created with document metadata, MIME type, and checksum.
4. Confirm event bus publishes `document.received` with application and user context.

### OCR Trigger Validation
1. Manually trigger or wait for OCR worker; ensure message consumed from queue.
2. Verify OCR job record created; status transitions from `pending` → `processing` → `completed`.
3. Confirm extracted fields stored and linked to document and application.
4. Validate retry behavior on transient failures and dead-letter queue capture on hard failures.

### Banking Analysis Trigger Validation
1. Submit banking data or Flinks webhook payload to banking ingestion endpoint.
2. Ensure analysis job enqueued and processed; status tracked in database.
3. Confirm derived metrics (cash flow, NSFs, balance trends) persisted and associated to application.
4. Validate audit logs show request origin, user, and correlation IDs.

### Sales Pipeline Automation
1. Create application and progress status through pipeline stages via API.
2. Validate automation rules fire (auto-assign, reminders, SLA timers) with event bus confirmations.
3. Ensure pipeline status visible in staff portal and reflected in CRM timeline.

### Lender Product Retrieval
1. Call lender product catalog endpoint per silo; expect 200 and correct product counts.
2. Validate products filtered by industry, province, and amount constraints.
3. Confirm caching headers or etags present and audit log recorded.

### Send-to-Lender Payload Validation
1. Trigger send-to-lender for chosen product; capture outbound payload.
2. Verify payload structure: applicant, business, financials, documents, and consent flags.
3. Assert transmission recorded with correlation ID and status `sent`.
4. Validate lender acknowledgement updates status to `delivered`.

### SignNow Initiation
1. Initiate SignNow package for selected documents; expect envelope ID response.
2. Confirm envelope metadata stored with signer roles and document references.
3. Ensure webhook subscription registered for callback URLs per environment.

### SignNow Callback Handling
1. Simulate callback with valid signature; expect 200 response.
2. Verify document statuses updated (signed/declined) and CRM timeline entry created.
3. Confirm signed PDFs stored and linked to application with checksum validation.

### Document Re-Mounting
1. Move document to cold storage; trigger re-mount request.
2. Verify rehydration job pulls document back to hot storage within SLA.
3. Confirm download endpoint returns file without checksum mismatch.

### CRM Timeline Entries
1. For each event (application created, document received, OCR completed, banking analysis, send-to-lender, SignNow events), ensure timeline entry created with timestamp and actor.
2. Validate entries visible in staff portal and API returns chronological order.

### AI Chatbot Message Routing
1. Post chatbot message tagged for AI handling; expect AI response with intent classification.
2. Validate fallback to FAQ or knowledge base when confidence below threshold.
3. Confirm conversation logged with AI transcript in CRM timeline.

### Talk-to-Human Routing
1. Send chatbot message requesting human; expect handoff event and agent assignment.
2. Confirm communication center opens session and timeline entry records agent join.

### Report-an-Issue Routing
1. Submit issue via chatbot; expect ticket creation with severity and reproduction steps captured.
2. Validate issue visible in staff portal with linkage to application and requester.
3. Confirm status updates propagate back to chatbot session.
