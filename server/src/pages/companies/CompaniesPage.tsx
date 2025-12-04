import { useEffect, useState } from "react";
import { fetchCompanies } from "@/lib/api/companies";

export default function CompaniesPage() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchCompanies().then(setList).catch(console.error);
  }, []);

  return (
    <>
      <h1>Companies</h1>
      <ul>
        {list.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </>
  );
}
