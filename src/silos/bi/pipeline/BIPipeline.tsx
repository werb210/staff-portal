import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { biFetch } from "../../../api/biClient";

type BIApplication = {
  id: string;
  stage: string;
  bankruptcy_flag?: boolean;
  primary_contact_name?: string;
  premium_calc?: {
    annualPremium?: number;
  };
};

const stages = [
  "new_application",
  "documents_pending",
  "under_review",
  "approved",
  "declined",
  "policy_issued"
];

export default function BIPipeline() {
  const [apps, setApps] = useState<BIApplication[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const data = await biFetch("/applications");
    setApps(data);
  }

  return (
    <div className="pipeline-container">
      {stages.map((stage) => (
        <div key={stage} className="pipeline-column">
          <h3>{stage.replace("_", " ").toUpperCase()}</h3>
          {apps
            .filter((a) => a.stage === stage)
            .map((app) => (
              <div
                key={app.id}
                className={`card ${app.bankruptcy_flag ? "red-flag" : ""}`}
                onClick={() => navigate(`/bi/pipeline/${app.id}`)}
                style={{ cursor: "pointer" }}
              >
                <p>
                  <strong>{app.primary_contact_name || "Applicant"}</strong>
                </p>
                <p>${app.premium_calc?.annualPremium || "-"}</p>
                {app.bankruptcy_flag && (
                  <span className="flag">⚠ Bankruptcy</span>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
