const mockResults = [
  { id: "1", title: "Application #123", type: "applications" },
  { id: "2", title: "Jane Doe", type: "contacts" },
  { id: "3", title: "Acme Corp", type: "companies" },
  { id: "4", title: "Lender X", type: "lenders" },
  { id: "5", title: "Priority Tag", type: "tags" },
];

export async function searchEverything(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!query) return { results: [] };
  const q = query.toLowerCase();
  return { results: mockResults.filter((item) => item.title.toLowerCase().includes(q)) };
}
