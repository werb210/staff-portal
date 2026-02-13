export interface Lead {
  id: string;
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;

  yearsInBusiness?: string;
  annualRevenue?: string;
  monthlyRevenue?: string;
  requestedAmount?: string;
  creditScoreRange?: string;

  productInterest?: string;
  industryInterest?: string;
  source: string;

  createdAt: string;
}
