import { useEffect, useState } from "react";
import DrawerContainer from "./DrawerContainer";
import ApplicationTabs from "./ApplicationTabs";
import {
  getApplication,
  getBanking,
  getFinancials,
  getDocuments,
  getLenders,
  acceptDocument,
  rejectDocument,
  replaceDocument,
  sendToLender,
} from "../../api/applications";

export default function ApplicationDrawer({
  id,
  open,
  onClose,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [app, setApp] = useState<any>(null);
  const [bank, setBank] = useState<any>(null);
  const [fin, setFin] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [lenders, setLenders] = useState<any[]>([]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [a, b, f, d, l] = await Promise.all([
      getApplication(id),
      getBanking(id),
      getFinancials(id),
      getDocuments(id),
      getLenders(id),
    ]);
    setApp(a);
    setBank(b);
    setFin(f);
    setDocs(d);
    setLenders(l);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
  }, [open, id]);

  const handleReplace = async (docId: string, file: File) => {
    await replaceDocument(docId, file);
    load();
  };

  return (
    <DrawerContainer open={open} onClose={onClose}>
      <div style={{ padding: 20, borderBottom: "1px solid #eee", fontWeight: 700 }}>
        Application #{id}
      </div>

      {loading ? (
        <div style={{ padding: 20 }}>Loading…</div>
      ) : (
        <ApplicationTabs
          tabs={[
            {
              key: "app",
              label: "Application",
              content: (
                <pre style={{ fontSize: 13 }}>
{JSON.stringify(app, null, 2)}
                </pre>
              ),
            },

            {
              key: "bank",
              label: "Banking",
              content: (
                <pre style={{ fontSize: 13 }}>
{JSON.stringify(bank, null, 2)}
                </pre>
              ),
            },

            {
              key: "fin",
              label: "Financials",
              content: (
                <pre style={{ fontSize: 13 }}>
{JSON.stringify(fin, null, 2)}
                </pre>
              ),
            },

            {
              key: "docs",
              label: "Documents",
              content: (
                <div>
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: 10,
                        border: "1px solid #ddd",
                        marginBottom: 10,
                        borderRadius: 6,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>{doc.status}</div>

                      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                        <a
                          href={doc.viewUrl}
                          target="_blank"
                          style={{
                            background: "#0078ff",
                            color: "#fff",
                            padding: "6px 10px",
                            borderRadius: 4,
                            textDecoration: "none",
                          }}
                        >
                          View
                        </a>

                        <button
                          onClick={() => acceptDocument(doc.id).then(load)}
                          style={{
                            background: "#0a960a",
                            color: "#fff",
                            padding: "6px 10px",
                            borderRadius: 4,
                            border: "none",
                          }}
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => rejectDocument(doc.id).then(load)}
                          style={{
                            background: "#b60000",
                            color: "#fff",
                            padding: "6px 10px",
                            borderRadius: 4,
                            border: "none",
                          }}
                        >
                          Reject
                        </button>

                        <label
                          style={{
                            background: "#444",
                            color: "#fff",
                            padding: "6px 10px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          Replace
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleReplace(doc.id, f);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },

            {
              key: "lenders",
              label: "Lenders",
              content: (
                <div>
                  {lenders.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        padding: 12,
                        border: "1px solid #ddd",
                        marginBottom: 10,
                        borderRadius: 6,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        Score: {l.score}
                      </div>
                      <button
                        style={{
                          marginTop: 8,
                          background: "#0078ff",
                          color: "#fff",
                          padding: "6px 10px",
                          border: "none",
                          borderRadius: 4,
                        }}
                        onClick={() => sendToLender(id!, l.id)}
                      >
                        Send to Lender
                      </button>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      )}
    </DrawerContainer>
  );
}
