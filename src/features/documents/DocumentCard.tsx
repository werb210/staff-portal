import React, { useRef, useState } from "react";
import { cn } from "../../lib/utils";

type Version = { version: string; author: string; at: string; note?: string };

type DocumentCardProps = {
  document: {
    id: string;
    name: string;
    category: string;
    status: "pending" | "accepted" | "rejected";
    metadata: Record<string, string>;
    versions: Version[];
  };
};

export function DocumentCard({ document }: DocumentCardProps) {
  const [status, setStatus] = useState(document.status);
  const [versions, setVersions] = useState<Version[]>(document.versions);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addVersion = (filename: string) => {
    const next: Version = {
      version: `v${versions.length + 1}`,
      author: "You",
      at: new Date().toLocaleString(),
      note: `Replaced with ${filename}`,
    };
    setVersions([next, ...versions]);
    setStatus("pending");
  };

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addVersion(file.name);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{document.category}</p>
          <h4 className="text-lg font-semibold text-slate-900">{document.name}</h4>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{document.id}</span>
            <span
              className={cn("rounded-full px-2 py-1", {
                "bg-emerald-50 text-emerald-700": status === "accepted",
                "bg-rose-50 text-rose-700": status === "rejected",
                "bg-amber-50 text-amber-700": status === "pending",
              })}
            >
              {status === "pending" ? "Pending review" : status === "accepted" ? "Accepted" : "Rejected"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            onClick={() => fileInputRef.current?.click()}
          >
            Replace file
          </button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleReplace} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Placeholder preview
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => setStatus("accepted")}
            >
              Accept
            </button>
            <button
              className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
              onClick={() => setStatus("rejected")}
            >
              Reject
            </button>
            <button
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setStatus("pending")}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h5 className="text-sm font-semibold text-slate-800">Metadata</h5>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
              {Object.entries(document.metadata).map(([key, value]) => (
                <React.Fragment key={key}>
                  <dt className="text-xs uppercase text-slate-500">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h5 className="text-sm font-semibold text-slate-800">Version history</h5>
            <ol className="mt-2 space-y-2">
              {versions.map((version, idx) => (
                <li key={`${version.version}-${idx}`} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <div>
                    <div className="font-semibold text-slate-900">{version.version}</div>
                    <div className="text-xs text-slate-500">{version.at}</div>
                    <div className="text-slate-700">{version.note ?? `Uploaded by ${version.author}`}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
