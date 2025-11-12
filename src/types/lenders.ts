export interface Lender {
  id: string;
  name: string;
  country: string;
  rating?: string;
  specialties?: string[];
}

export interface LenderProduct {
  id: string;
  lenderId: string;
  name: string;
  rate: string;
  maxAmount: number;
  minAmount: number;
}

export interface SendToLenderPayload {
  applicationId: string;
  lenderId: string;
  notes?: string;
}
