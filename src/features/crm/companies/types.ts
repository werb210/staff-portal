export interface Company {
  id: string;
  name: string;
  industry?: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  tags: string[];
  createdAt: string;
}

export interface CompanyForm {
  name: string;
  industry?: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  tags: string[];
}
