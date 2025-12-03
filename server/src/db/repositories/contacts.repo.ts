export type Contact = Record<string, any> & { id?: string };

export const contactsRepo = {
  async findMany(): Promise<Contact[]> {
    return [];
  },
  async findById(id: string): Promise<Contact | null> {
    return { id } as Contact;
  },
  async create(payload: Contact): Promise<Contact> {
    return { ...payload, id: payload.id ?? `contact-${Date.now()}` };
  },
  async update(id: string, payload: Contact): Promise<Contact> {
    return { ...payload, id };
  },
  async delete(id: string): Promise<boolean> {
    return Boolean(id);
  },
};

export default contactsRepo;
export { contactsRepo };
