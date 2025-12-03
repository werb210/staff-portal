// server/src/db/repositories/contacts.repo.ts
// NOTE: This is a SAFE STUB for the staff-portal backend.
// It is only here so the portal can BUILD and RUN without needing a real DB
// behind the contacts repository. All DB work happens on the Staff-Server.

export type ContactRecord = {
  id: string;
  [key: string]: unknown;
};

const contactsRepo = {
  /**
   * List contacts with an optional filter.
   * In this stub, always returns an empty array.
   */
  async findMany(_filter: Record<string, unknown> = {}): Promise<ContactRecord[]> {
    return [];
  },

  /**
   * Find a single contact by ID.
   * In this stub, always returns null.
   */
  async findById(_id: string): Promise<ContactRecord | null> {
    return null;
  },

  /**
   * Search contacts by a query string.
   * In this stub, always returns an empty array.
   */
  async search(_query: string): Promise<ContactRecord[]> {
    return [];
  },

  /**
   * Create a new contact.
   * In this stub, throws to make it obvious this should not be used
   * for real persistence in the staff-portal. The real DB lives on Staff-Server.
   */
  async create(_data: Record<string, unknown>): Promise<ContactRecord> {
    throw new Error(
      "contactsRepo.create is not implemented in staff-portal. Use Staff-Server API instead."
    );
  },

  /**
   * Update an existing contact.
   * In this stub, throws for the same reason as create().
   */
  async update(_id: string, _data: Record<string, unknown>): Promise<ContactRecord | null> {
    throw new Error(
      "contactsRepo.update is not implemented in staff-portal. Use Staff-Server API instead."
    );
  },

  /**
   * Delete an existing contact.
   * In this stub, throws for the same reason as create()/update().
   */
  async delete(_id: string): Promise<void> {
    throw new Error(
      "contactsRepo.delete is not implemented in staff-portal. Use Staff-Server API instead."
    );
  },
};

export default contactsRepo;
