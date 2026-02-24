import { useEffect, useState } from "react";
import { biFetch } from "../../../api/biClient";
import ActivityTimeline from "../components/ActivityTimeline";

type Application = {
  id: string;
  primary_contact_name?: string;
  stage?: string;
  premium_calc?: {
    annualPremium?: number;
  };
};

export default function BILenderPortal() {
  const [apps, setApps] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const data = await biFetch("/lender/applications");
    setApps(data);
  }

  async function uploadDocs(appId: string, files: FileList | null) {
    if (!files) return;

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        formData.append("files", file);
      }
    }

    await fetch(`/api/bi/application/${appId}/documents`, {
      method: "POST",
      body: formData
    });

    alert("Documents uploaded");
    void load();
  }

  return (
    <div>
      <h2>Lender Applications</h2>

      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ width: "40%" }}>
          {apps.map((app) => (
            <div
              key={app.id}
              className="crm-card"
              onClick={() => setSelected(app)}
              style={{ cursor: "pointer" }}
            >
              <strong>{app.primary_contact_name || "Applicant"}</strong>
              <p>Stage: {app.stage || "-"}</p>
              <p>Premium: ${app.premium_calc?.annualPremium?.toLocaleString() || "-"}</p>
            </div>
          ))}
        </div>

        <div style={{ width: "60%" }}>
          {selected && (
            <>
              <h3>Application Detail</h3>

              <p>Stage: {selected.stage || "-"}</p>
              <p>Premium: ${selected.premium_calc?.annualPremium?.toLocaleString() || "-"}</p>

              <h4>Upload Additional Documents</h4>
              <input type="file" multiple onChange={(e) => void uploadDocs(selected.id, e.target.files)} />

              <ActivityTimeline applicationId={selected.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
