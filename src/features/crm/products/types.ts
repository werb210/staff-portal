export interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  tags: string[];
  createdAt: string;
}

export interface ProductForm {
  name: string;
  category?: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  tags: string[];
}
