import { useState } from "react";
import Card from "@/components/ui/Card";
import RequireRole from "@/components/auth/RequireRole";
import {
  useAiIssuesQuery,
  useDeleteIssueMutation,
  useResolveIssueMutation,
  type AiIssueReport
} from "@/services/aiService";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const toProtectedScreenshotUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  return null;
};

const AiIssueReportsContent = () => {
  const { data: issues = [], isLoading } = useAiIssuesQuery();
  const resolveMutation = useResolveIssueMutation();
  const deleteMutation = useDeleteIssueMutation();
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
                  <th className="px-3 py-2">Context</th>
                  <th className="px-3 py-2">Page URL</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Screenshot</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Assigned to</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => {
                  const protectedUrl = toProtectedScreenshotUrl(issue.screenshotUrl);
                  return (
                    <tr key={issue.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">{issue.status}</td>
                      <td className="px-3 py-2">{issue.context ?? "website"}</td>
                      <td className="px-3 py-2 max-w-[180px] truncate">{issue.pageUrl}</td>
                      <td className="px-3 py-2 max-w-[220px] truncate">{issue.description}</td>
                      <td className="px-3 py-2">
                        {protectedUrl ? (
                          <img
                            src={protectedUrl}
                            alt="Issue screenshot preview"
                            className="h-10 w-16 rounded border border-slate-200 object-cover"
                          />
                        ) : (
                          "Protected"
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
                          <button
                            type="button"
                            disabled={issue.status !== "Resolved"}
                            onClick={() => deleteMutation.mutate(issue.id)}
                            className="rounded bg-rose-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <p>
                <span className="font-semibold">Context:</span> {selectedIssue.context ?? "website"}
              </p>
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
                <span className="font-semibold">Timestamp:</span> {formatDate(selectedIssue.createdAt)}
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
