import SLFTabApplication from "./SLFTabApplication";
import SLFTabDocuments from "./SLFTabDocuments";
import SLFTabNotes from "./SLFTabNotes";
import { useState } from "react";

const TABS = [
  { id: "application", label: "Application Data" },
  { id: "documents", label: "Documents" },
  { id: "notes", label: "Notes" }
] as const;

export type SLFDrawerTab = (typeof TABS)[number]["id"];

const SLFApplicationDrawer = ({ applicationId, onClose }: { applicationId: string | null; onClose: () => void }) => {
  const [tab, setTab] = useState<SLFDrawerTab>("application");

  if (!applicationId) return null;

  return (
    <div className="application-drawer-overlay">
      <div className="application-drawer">
        <div className="application-drawer__header">
          <div>
            <div className="application-drawer__title">SLF Application {applicationId}</div>
            <div className="application-drawer__subtitle">SLF silo viewer</div>
          </div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="application-drawer__content">
          {tab === "application" && <SLFTabApplication applicationId={applicationId} />}
          {tab === "documents" && <SLFTabDocuments applicationId={applicationId} />}
          {tab === "notes" && <SLFTabNotes applicationId={applicationId} />}
        </div>
      </div>
    </div>
  );
};

export default SLFApplicationDrawer;
