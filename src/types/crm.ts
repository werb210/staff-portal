export type LeadSource = "website_contact" | "website_credit_check" | "chat_start" | "startup_interest" | "credit_readiness";

export type LeadMetadata = {
  yearsInBusiness?: string | number;
  annualRevenue?: string | number;
  monthlyRevenue?: string | number;
  requestedAmount?: string | number;
  creditScoreRange?: string | number;
  revenue?: string | number;
  accountsReceivable?: string | number;
  availableCollateral?: string | number;
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
  pendingApplicationId?: string;
  source: LeadSource;
  createdAt: string;
  metadata?: LeadMetadata;
}

export type LeadType = "application" | "credit_readiness";

export interface CRMLead {
  id: string;
  type: LeadType;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry?: string;
  yearsInBusiness?: string;
  annualRevenue?: string;
  monthlyRevenue?: string;
  arBalance?: string;
  availableCollateral?: string;
  score?: number;
  tier?: string;
  createdAt: string;
}
