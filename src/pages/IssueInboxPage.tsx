import { useEffect, useState } from "react";

type Issue = {
  id: string;
  message: string;
  screenshot?: string;
  createdAt: string;
};

export default function IssueInboxPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetch("/api/support/issues")
      .then((response) => response.json())
      .then(setIssues);
  }, []);

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
          <div>{issue.message}</div>
          {issue.screenshot ? <img src={issue.screenshot} className="mt-2 max-w-md" alt="Issue screenshot" /> : null}
          <button onClick={() => deleteIssue(issue.id)} className="mt-2 text-sm text-red-600">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
