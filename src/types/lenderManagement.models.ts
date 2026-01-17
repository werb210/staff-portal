import type {
  DocumentType,
  LenderProductCategory,
  RateType,
  SubmissionMethod,
  TermUnit
} from "./lenderManagement.types";

export type LenderAddress = {
  street: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};

export type LenderPrimaryContact = {
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
};

export type LenderSubmissionConfig = {
  method: SubmissionMethod;
  apiBaseUrl: string | null;
  apiClientId: string | null;
  apiUsername: string | null;
  apiPassword: string | null;
  submissionEmail: string | null;
};

export type LenderOperationalLimits = {
  maxLendingLimit: number | null;
  maxLtv: number | null;
  maxLoanTerm: number | null;
  maxAmortization: number | null;
};

export type Lender = {
  id: string;
  name: string;
  active: boolean;
  address: LenderAddress;
  phone: string;
  website: string | null;
  description: string | null;
  internalNotes: string | null;
  processingNotes: string | null;
  primaryContact: LenderPrimaryContact;
  submissionConfig: LenderSubmissionConfig;
  operationalLimits: LenderOperationalLimits;
};

export type LenderPayload = Omit<Lender, "id">;

export type LenderProductTermLength = {
  min: number;
  max: number;
  unit: TermUnit;
};

export type LenderProductEligibilityFlags = {
  minimumRevenue: number | null;
  timeInBusinessMonths: number | null;
  industryRestrictions: string | null;
};

export type ProductDocumentRequirement = DocumentType;

export type LenderProduct = {
  id: string;
  lenderId: string;
  productName: string;
  active: boolean;
  category: LenderProductCategory;
  country: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  interestRateMin: number;
  interestRateMax: number;
  rateType: RateType;
  termLength: LenderProductTermLength;
  minimumCreditScore: number | null;
  ltv: number | null;
  eligibilityRules: string | null;
  eligibilityFlags: LenderProductEligibilityFlags;
  requiredDocuments: ProductDocumentRequirement[];
};

export type LenderProductPayload = Omit<LenderProduct, "id">;
