import { useState } from "react";
import Card from "@/components/ui/Card";
import ContactsPage from "./contacts/ContactsPage";
import CompaniesPage from "./companies/CompaniesPage";
import TimelineFeed from "./timeline/TimelineFeed";
import RequireRole from "@/components/auth/RequireRole";

const CRMContent = () => {
  const [view, setView] = useState<"contacts" | "companies" | "timeline">("contacts");
  return (
    <div className="page">
      <Card
        title="CRM Navigation"
        actions={
          <div className="flex gap-2">
            <button onClick={() => setView("contacts")}>Contacts</button>
            <button onClick={() => setView("companies")}>Companies</button>
            <button onClick={() => setView("timeline")}>Global Timeline</button>
          </div>
        }
      >
        <p>
          Manage contacts, companies, communications, and timeline entries across BF, BI, and SLF silos.
        </p>
      </Card>
      {view === "contacts" && <ContactsPage />}
      {view === "companies" && <CompaniesPage />}
      {view === "timeline" && (
        <Card title="Global Timeline">
          <TimelineFeed entityType="contact" entityId="c1" />
        </Card>
      )}
    </div>
  );
};

const CRMPage = () => (
  <RequireRole roles={["ADMIN", "STAFF"]}>
    <CRMContent />
  </RequireRole>
);

export default CRMPage;
