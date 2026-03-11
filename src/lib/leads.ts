import { withApiBase } from "@/lib/apiBase";
export const fetchLeads = async () => {
  const res = await fetch(withApiBase("/api/crm/leads"));

  if (!res.ok) {
    throw new Error("Failed to fetch leads");
  }

  return res.json();
};
