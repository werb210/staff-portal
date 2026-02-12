import { useEffect, useState } from "react";

type IssueReport = {
  id: string;
  description: string;
  screenshot?: string;
};

type IssueReportsProps = {
  isAdmin: boolean;
};

export function IssueReports({ isAdmin }: IssueReportsProps) {
  const [reports, setReports] = useState<IssueReport[]>([]);

  async function load() {
    const res = await fetch("/api/support/reports");
    const data = (await res.json()) as IssueReport[];
    setReports(data);
  }

  useEffect(() => {
    if (!isAdmin) return;
    void load();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Reported Issues</h2>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="rounded border border-slate-200 p-3">
            <p>{report.description}</p>
            {report.screenshot && <img src={report.screenshot} width="300" alt="Issue screenshot" className="mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
