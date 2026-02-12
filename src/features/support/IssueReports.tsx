import { useEffect, useState } from "react";
import { getIssueReports } from "@/api/support";

type IssueReportsProps = {
  isAdmin?: boolean;
};

function IssueReports({ isAdmin = true }: IssueReportsProps) {
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    void load();
  }, [isAdmin]);

  async function load() {
    const data = await getIssueReports();
    setIssues(data.issues || []);
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <h2>Reported Issues</h2>
      {issues.map((i) => (
        <div key={i.id} style={{ marginBottom: 20 }}>
          <div>
            <strong>Description:</strong> {i.description}
          </div>
          <img src={i.screenshot} alt="screenshot" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </div>
      ))}
    </div>
  );
}

export default IssueReports;
export { IssueReports };
