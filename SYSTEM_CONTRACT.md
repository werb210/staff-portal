SYSTEM_CONTRACT.md

Boreal Financial – Staff Portal

This document is the single source of truth for the Staff Portal’s behavior.
No UI component, route, state machine, or client-side logic may contradict this contract.

The Staff Portal is a controlled operator interface, not a source of truth.

⸻

1. Role of the Staff Portal

The Staff Portal:
	•	Is a read/write operator UI on top of the Staff Server
	•	Never owns business logic
	•	Never derives authoritative data
	•	Never bypasses server validation
	•	Never mutates frozen state

The server is always authoritative.

⸻

2. User Roles

The portal supports the following roles:
	•	Admin
	•	Staff
	•	Lender
	•	Referrer (future)

Role enforcement is server-driven.
The portal must assume server rejection is final.

⸻

3. Core Screens

3.1 Applications List (Sales Pipeline)
	•	Displays applications grouped by pipeline stage
	•	Drag-and-drop is a request, not an action
	•	Server decides if a stage transition is allowed
	•	UI must revert on rejection

⸻

3.2 Application Detail View (Canonical Order)

The application card must render sections in this exact order:
	1.	Application
	2.	Financials
	3.	Banking Analysis
	4.	Credit Summary
	5.	Documents
	6.	Notes
	7.	Lender Matching

No reordering.
No conditional hiding based on opinion.
Visibility is role-based only.

⸻

4. Section Contracts

4.1 Application
	•	Displays submitted application fields
	•	Editable only before lender acceptance
	•	Locked after acceptance

⸻

4.2 Financials
	•	Displays OCR output from non-bank documents
	•	Read-only
	•	Never editable in the portal
	•	May be reprocessed via explicit admin action

⸻

4.3 Banking Analysis
	•	Displays OCR output from bank statements only
	•	Read-only
	•	Must clearly distinguish from Financials
	•	Never merged with Financials in UI or state

⸻

4.4 Credit Summary
	•	Derived view only
	•	No uploads
	•	No edits
	•	Staff-only
	•	Used for underwriting + lender matching context

⸻

4.5 Documents
	•	Displays uploaded files and versions
	•	Supports:
	•	View
	•	Download
	•	Accept
	•	Reject
	•	Reject triggers server-side notification flow
	•	Accepted versions become immutable

⸻

4.6 Notes
	•	Internal only
	•	Staff ↔ Staff
	•	Never visible to:
	•	Clients
	•	Lenders
	•	Never exported
	•	Never transmitted externally

⸻

4.7 Lender Matching
	•	Displays eligible lender products
	•	Matching is based on:
	•	Credit Summary
	•	Product country availability
	•	Required documents
	•	HQ country is never used
	•	Once lender accepts:
	•	Matching freezes
	•	UI becomes read-only

⸻

5. Startup Products
	•	No global “startup mode”
	•	Startup appears only if a startup lender product exists
	•	Portal must not fabricate startup flows
	•	If no startup product exists, startup UI must not render

⸻

6. Commission Visibility
	•	Commission configuration:
	•	Visible to Admin
	•	Read-only to Staff
	•	Commission values:
	•	Frozen at lender acceptance
	•	Never recalculated client-side
	•	Profit share schedules are displayed, not computed

⸻

7. Mutability Rules

The portal must enforce visual locks for:
	•	Accepted applications
	•	Accepted document versions
	•	Accepted lender matches
	•	Frozen commission structures

If the server rejects a mutation, the portal must revert immediately.

⸻

8. Prohibited Behavior

The portal must never:
	•	Infer business logic
	•	Compute eligibility
	•	Alter country availability
	•	Expose internal notes
	•	Expose OCR internals to clients or lenders
	•	Bypass server state

⸻

9. Error Handling
	•	Server errors are authoritative
	•	No silent failures
	•	No optimistic persistence without rollback
	•	All failed actions must surface a reason

⸻

10. Extensibility Guarantees

The portal must support without refactor:
	•	New application sections (server-driven)
	•	New OCR outputs
	•	New lender product types
	•	New commission models
	•	New internal-only panels

⸻

11. Enforcement
	•	Any UI behavior contradicting this contract is a bug
	•	Tests should assert:
	•	Section order
	•	Role visibility
	•	Locked state behavior
	•	Future Codex blocks must reference this contract

⸻
