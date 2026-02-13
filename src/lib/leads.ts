export const fetchLeads = async () => {
  const res = await fetch("/api/crm/leads");

  if (!res.ok) {
    throw new Error("Failed to fetch leads");
  }

  return res.json();
};
