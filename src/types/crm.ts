export type LeadSource = "website_contact" | "website_credit_check" | "chat_start" | "startup_interest" | "credit_readiness";

export type LeadMetadata = {
  yearsInBusiness?: string | number;
  annualRevenue?: string | number;
  monthlyRevenue?: string | number;
  requestedAmount?: string | number;
  creditScoreRange?: string | number;
  revenue?: string | number;
  accountsReceivable?: string | number;
  existingDebt?: string | number;
  score?: string | number;
};

export interface Lead {
  id: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industry?: string;
  productInterest?: string;
  industryInterest?: string;
  tags?: string[];
  source: LeadSource;
  createdAt: string;
  metadata?: LeadMetadata;
}
