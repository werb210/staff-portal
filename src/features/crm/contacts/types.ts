export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  email: string;
  phone?: string;
  company?: string;
  tags: string[];
  createdAt: string;
}

export interface ContactForm {
  firstName: string;
  lastName: string;
  title?: string;
  email: string;
  phone?: string;
  company?: string;
  tags: string[];
}
