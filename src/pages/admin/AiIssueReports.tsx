import { useState } from "react";
import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import { useAiIssuesQuery, useResolveIssueMutation, type AiIssueReport } from "@/services/aiService";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const AiIssueReportsContent = () => {
  const { data: issues = [], isLoading } = useAiIssuesQuery();
  const resolveMutation = useResolveIssueMutation();
  const [selectedIssue, setSelectedIssue] = useState<AiIssueReport | null>(null);

  return (
    <div className="page">
      <Card title="AI Issue Reports">
        {isLoading ? <p>Loading issue reports...</p> : null}
        {!isLoading && issues.length === 0 ? <p>No issue reports available.</p> : null}
        {!isLoading && issues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Page URL</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Screenshot</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Assigned to</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{issue.status}</td>
                    <td className="px-3 py-2 max-w-[180px] truncate">{issue.pageUrl}</td>
                    <td className="px-3 py-2 max-w-[220px] truncate">{issue.description}</td>
                    <td className="px-3 py-2">
                      {issue.screenshotUrl ? (
                        <img
                          src={issue.screenshotUrl}
                          alt="Issue screenshot preview"
                          className="h-10 w-16 rounded border border-slate-200 object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2">{formatDate(issue.createdAt)}</td>
                    <td className="px-3 py-2">{issue.assignedTo ?? "Unassigned"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedIssue(issue)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={issue.status === "Resolved"}
                          onClick={() => resolveMutation.mutate(issue.id)}
                          className="rounded bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Mark resolved
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <div
        className={`fixed inset-0 z-40 transition ${selectedIssue ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!selectedIssue}
      >
        <div
          className={`absolute inset-0 bg-slate-900/30 transition-opacity ${selectedIssue ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSelectedIssue(null)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-2xl transition-transform ${
            selectedIssue ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Issue details</h3>
            <button type="button" onClick={() => setSelectedIssue(null)} className="text-sm text-slate-500">
              Close
            </button>
          </div>

          {selectedIssue ? (
            <div className="space-y-3 text-sm">
              {selectedIssue.screenshotUrl ? (
                <img
                  src={selectedIssue.screenshotUrl}
                  alt="Issue screenshot"
                  className="w-full rounded border border-slate-200"
                />
              ) : null}
              <p>
                <span className="font-semibold">Page:</span> {selectedIssue.pageUrl}
              </p>
              <p>
                <span className="font-semibold">Description:</span> {selectedIssue.description}
              </p>
              <p>
                <span className="font-semibold">Browser:</span> {selectedIssue.browserInfo ?? "—"}
              </p>
              <p>
                <span className="font-semibold">Chat session:</span>{" "}
                {selectedIssue.chatSessionId ? (
                  <a className="text-blue-700 underline" href={`/admin/ai/chats?chatId=${selectedIssue.chatSessionId}`}>
                    Open chat
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

const AiIssueReports = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <AiIssueReportsContent />
  </RequireRole>
);

export default AiIssueReports;
