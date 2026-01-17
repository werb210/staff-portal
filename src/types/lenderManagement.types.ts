export const FUNDING_TYPES = [
  "LOC",
  "Term",
  "Factoring",
  "Equipment",
  "PO",
  "SBA",
  "Bridge",
  "MerchantCashAdvance"
] as const;

export type FundingType = (typeof FUNDING_TYPES)[number];

export const DOCUMENT_TYPES = [
  "bank_statements",
  "tax_returns",
  "financial_statements",
  "ar_aging",
  "ap_aging",
  "void_cheque",
  "business_plan",
  "driver_license",
  "incorporation_docs",
  "personal_financial_statement"
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const PRODUCT_TYPES = [
  "line_of_credit",
  "term_loan",
  "invoice_factoring",
  "equipment_financing",
  "purchase_order",
  "merchant_cash_advance",
  "bridge_loan"
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export type LenderStatus = "active" | "paused";
