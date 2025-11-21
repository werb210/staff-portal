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

export interface PagedApplicationsResponse {
  items: Application[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
