import contactsRepo from "../db/repositories/contacts.repo.js";

export type SearchResult = {
  id: string;
  type: "contact";
  label: string;
  email?: string | null;
  phone?: string | null;
};

export const searchService = {
  async globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || typeof query !== "string") return [];

    const q = query.toLowerCase();

    const contacts = await contactsRepo.findMany({});
    const matchedContacts = contacts
      .filter((c) => {
        const name = (c.name ?? "").trim().toLowerCase();
        const email = (c.email ?? "").toLowerCase();
        const phone = (c.phone ?? "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      })
      .map((c) => ({
        id: c.id,
        type: "contact" as const,
        label: c.name?.trim() || c.email || "Untitled Contact",
        email: c.email ?? null,
        phone: c.phone ?? null,
      }));

    return matchedContacts;
  },
};

export default searchService;
