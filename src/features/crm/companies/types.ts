export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  tags: string[];
  createdAt: string;
}

export interface CompanyForm {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  tags: string[];
}
