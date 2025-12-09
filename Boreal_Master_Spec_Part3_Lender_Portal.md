🚀 Boreal Master Specification (V1) — PART 3: LENDER PORTAL

Codex-Ready Engineering Specification

This defines the complete Lender Portal, including login, 2FA, dashboards, product management, required-doc customization, and integration with the Staff-Server.

It must follow the exact same technology stack, UI style, and layout system as the Staff-Portal.

⸻

1. Purpose of the Lender Portal

The Lender Portal allows lenders to:
1.Log into their dedicated workspace (separate role from staff/admin)
2.Review performance stats
3.Edit their own company information
4.Create and manage their lender products
5.Upload application forms for each product
6.Define & customize required documents (checkboxes + custom additions)
7.Set commission percentage per product
8.Manage submission endpoints (email/URL/API credentials)

Lenders can ONLY see and edit their own data.
Nothing else in the system is visible to them.

⸻

2. High-Level Architecture

2.1 Tech Stack

Same as Staff-Portal:
•React + TypeScript
•Vite
•React Query
•Zustand
•React Router (with role protection)
•Tailwind + shadcn components
•JWT Authentication
•SMS-based 2FA

2.2 Lender Portal Route Namespace

All lender portal pages must live under:

/lender
    /login
    /dashboard
    /company
    /products

Access is strictly locked by role = LENDER.

⸻

3. Authentication & Security

3.1 Login Page
•Email
•Password
•“Forgot password” triggers Staff-Server reset flow
•On successful login → move to 2FA screen

3.2 Two-Factor Authentication
•The code is sent via SMS
•Form must include:
•Code entry
•Resend code
•Verify button

3.3 Session Rules
•Must use JWT access token
•Refresh token rotation if implemented in Staff-Server
•Automatic logout on 401/403
•Full role-based route protection

⸻

4. Lender Dashboard

Upon login, the Lender sees a clean metrics dashboard showing:

Performance KPIs
•Time to Offer
•Time to Fund
•Closing Rate
•Volume Over Time (chart)
•Submissions by Stage (Qualified / Docs / Approval / Funded / Declined)
•Time to Offer Distribution (bar chart)

Charts must use the Staff-Portal chart components for consistency.

⸻

5. Company Info Page

Route: /lender/company

Editable lender company profile:

Basic Info:
•Company Name
•Contact Name
•Contact Email
•Contact Phone
•Website
•Description (textarea)

Submission Settings:
•Submission Email
•Submission Method (Email / Webhook / API)
•Submission URL
•Token Request URL (OAuth flows if required)

API Credentials:
•API Key
•API Username
•API Password

Staff-Server provides and stores these securely.

Save Behavior
•On Save → PATCH to Staff-Server
•Real-time validation

⸻

6. Products Page

Route: /lender/products

6.1 List View

Shows all products owned by this lender:

Columns:
•Product Name
•Category
•Min/Max Amount
•Active/Inactive status
•Edit
•Delete

Button: Add Product

⸻

7. Add/Edit Product Page

Every product consists of the following blocks.

7.1 Basic Info
•Name
•Description
•Category
•Min amount
•Max amount
•Interest rate range
•Term range
•Commission percentage (NEW requirement)

7.2 Required Documents

Two systems must be present:

A) Checkbox list of all standard document categories
(e.g., bank statements, tax returns, AR aging, AP aging, etc.)

B) Ability to add custom required document categories:
•Field: “Add custom document requirement”
•Click “+ Add” → Appears in the list

These selections must be saved to the Staff-Server and inform the Client App (Step 5).

7.3 Lender Application Form Upload
•Lender must upload their PDF application form
•Stored in Blob storage
•Sent to Staff-Server
•File metadata stored under this product
•Used later to generate dynamic Step 3 & Step 4 questions

7.4 Submission Settings (Product-Specific)
•Override submission email
•Override submission URL
•Override API settings

7.5 Status
•Active
•Inactive

⸻

8. Deleting and Inactivating Products

Delete

This removes the product entirely if it has never been used.

Inactivate

Product remains in history but is hidden from Client App recommendation engine.

All business logic executed by Staff-Server.

⸻

9. Integration With Client App

The Lender Portal provides the rules the Client App uses for:
•Dynamic questions (Step 3 & 4)
•Required document categories (Step 5)
•Lender product filters
•Commission percentages (used by AI marketing engine)

All product changes push through the Staff-Server → cached locally by the Client App.

⸻

10. Integration With Staff Portal

Staff-Portal must pull the same data from Staff-Server for:
•Reviewing product details
•Reviewing submission endpoints
•Sending actual applications to lenders
•Seeing required document lists
•Seeing product category rules

Staff can do everything lenders can, but across every lender.

⸻

11. UI/UX Requirements

Consistent Layout

The Lender Portal must reuse the Staff-Portal layout system, but sidebar options are restricted.

Sidebar for Lenders:
1.Dashboard
2.Company Info
3.Products

Nothing else is allowed.

Modals
•Product deletion
•Adding custom doc types
•Uploading application forms

Form Validation
•Strict TypeScript types
•Error + success banners

⸻

12. Testing Requirements

Codex must generate:

Unit tests:
•Product form
•Company info form
•Required-docs builder
•Application form uploader

Integration tests:
•Editing a product
•Updating required docs
•Uploading a lender form
•Toggling active/inactive

End-to-end tests:
•Lender login
•2FA
•Dashboard rendering
•Full product creation flow

⸻

END OF PART 3 — LENDER PORTAL SPEC
