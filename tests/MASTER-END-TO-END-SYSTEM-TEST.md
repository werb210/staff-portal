# MASTER END-TO-END SYSTEM TEST SUITE

This master document aggregates cross-system scenarios for Client App, Staff Server, and Staff Portal.

## Cross-System Coverage
1. Client App → Staff-Server interoperability
2. Client App → Staff-Portal visibility
3. Document lifecycle from client → storage → staff portal
4. OCR lifecycle
5. Banking analysis lifecycle
6. AI insights → credit summary behavior
7. Lender matching
8. Send-to-lender routing
9. Status propagation back to client
10. Voice/SMS/Email routing via Communication Center
11. CRM timeline verification
12. Multi-silo segregation (BF / BI / SLF)
13. Authentication + role checks
14. Data consistency checks across all systems

## Test Scenarios

### 1) Client App → Staff-Server Interoperability
- Submit application from client; verify Staff Server receives payload, persists records, and emits `application.created`.
- Ensure correlation IDs flow through message bus and audit logs.

### 2) Client App → Staff-Portal Visibility
- Confirm newly submitted application surfaces in Staff Portal dashboard with correct silo and owner.
- Validate status, notes, and assigned team members mirror Staff Server data.

### 3) Document Lifecycle
- Upload required docs from client; ensure storage paths generated and DB records created.
- Validate docs appear in Staff Portal with correct statuses, previews, and download links.
- Confirm accept/reject actions reflect back to client with updated requirements.

### 4) OCR Lifecycle
- Trigger OCR on uploaded docs; track job creation, processing, and completion in Staff Server.
- Verify extracted data populates application fields and shows in Staff Portal timelines.

### 5) Banking Analysis Lifecycle
- Ingest banking data (Flinks webhook); ensure analysis job runs and metrics recorded.
- Confirm results displayed in Staff Portal banking tab and exportable via API.

### 6) AI Insights → Credit Summary Behavior
- Run AI insights on application; validate generated credit summary PDF and key metrics.
- Ensure summary accessible in Staff Portal and attached to application timeline.

### 7) Lender Matching
- Execute lender match flow using current application data; verify ranked products and match %.
- Ensure matches respect silo segmentation and quota limits.

### 8) Send-to-Lender Routing
- Trigger send-to-lender; capture outbound payload and lender acknowledgement.
- Validate status transitions (`sent`, `delivered`) and timeline entries across systems.

### 9) Status Propagation Back to Client
- Update application status in Staff Portal/Server; confirm client app reflects new status via polling/webhooks.
- Validate end-user notifications and messaging reflect the updated state.

### 10) Voice/SMS/Email Routing via Communication Center
- Send communications from Staff Portal; ensure delivery events recorded and visible in client message center where applicable.
- Confirm call recordings, SMS threads, and emails log to CRM timeline with correct silo context.

### 11) CRM Timeline Verification
- Cross-check timeline entries for all major events (applications, docs, OCR, banking, lender actions, communications).
- Verify ordering, actor attribution, and visibility in both Staff Portal and Staff Server APIs.

### 12) Multi-Silo Segregation (BF / BI / SLF)
- Switch silos and repeat submission and processing; ensure data remains silo-scoped.
- Validate permissions, lender catalogs, and communication routing respect silo boundaries.

### 13) Authentication + Role Checks
- Test role-based access across client, server, and portal for admins, agents, lenders, and applicants.
- Confirm unauthorized actions are blocked and logged with appropriate error codes.

### 14) Data Consistency Across Systems
- Compare key fields (status, assigned agent, required docs, lender decisions) between client UI, Staff Server DB/API, and Staff Portal UI.
- Validate no drift after retries, edits, or concurrent updates.
