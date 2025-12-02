export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  title?: string;
  tags: string[];
  createdAt: string;
}

export interface ContactForm {
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  title?: string;
  tags: string[];
}
