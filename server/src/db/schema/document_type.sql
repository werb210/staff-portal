-- Document type enum used by documents table
-- Added `signed_application` for SignNow executed packages
CREATE TYPE document_type AS ENUM (
  'bank_statements',
  'financials',
  'tax_returns',
  'id_verification',
  'void_cheque',
  'signed_application'
);
