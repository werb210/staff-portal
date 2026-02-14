import { useEffect, useState } from "react";

type Issue = {
  id: string;
  message: string;
  screenshot?: string;
  createdAt: string;
  resolved?: boolean;
};

export default function IssueInboxPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetch("/api/support/issues")
      .then((response) => response.json())
      .then((data) => {
        setIssues(Array.isArray(data) ? data : []);
      });
  }, []);

  function markResolved(id: string) {
    setIssues((previous) =>
      previous.map((issue) => (issue.id === id ? { ...issue, resolved: true } : issue))
    );
  }

  async function deleteIssue(id: string) {
    await fetch(`/api/support/issues/${id}`, {
      method: "DELETE"
    });

    setIssues((previous) => previous.filter((issue) => issue.id !== id));
  }

  return (
    <div className="p-6">
      <h2 className="mb-4 font-semibold">Reported Issues</h2>
      {issues.map((issue) => (
        <div key={issue.id} className="mb-4 border p-4">
          <div className="text-sm">{issue.message}</div>
          {issue.screenshot ? <img src={issue.screenshot} className="mt-2 max-h-44 max-w-md border" alt="Issue screenshot" /> : null}
          <div className="mt-2 text-xs text-slate-500">{new Date(issue.createdAt).toLocaleString()}</div>
          <div className="mt-2 flex items-center gap-4">
            <button onClick={() => markResolved(issue.id)} className="text-sm text-emerald-700" disabled={issue.resolved}>
              {issue.resolved ? "Resolved" : "Mark resolved"}
            </button>
            <button onClick={() => void deleteIssue(issue.id)} className="text-sm text-red-600">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
