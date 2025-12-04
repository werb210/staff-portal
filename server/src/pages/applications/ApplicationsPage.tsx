import { useEffect, useState } from "react";
import { fetchApplications } from "@/lib/api/applications";

export default function ApplicationsPage() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchApplications().then(setList).catch(console.error);
  }, []);

  return (
    <>
      <h1>Applications</h1>
      <ul>
        {list.map((a) => (
          <li key={a.id}>{a.businessName}</li>
        ))}
      </ul>
    </>
  );
}
