export interface Application {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  createdAt: string;
  status: string;
}

export interface ApplicationListResponse {
  items: Application[];
}
