import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CompaniesAPI } from "../api/companies";
import CompanyEditor from "../components/companies/CompanyEditor";
import ContactsTable from "../components/contacts/ContactsTable";
import MainLayout from "../layout/MainLayout";

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    CompaniesAPI.get(id).then((r) => setCompany(r.data));
  }, [id]);

  if (!company) return <div>Loading…</div>;

  return (
    <MainLayout>
      <div className="company-detail space-y-6">
        <h1 className="text-2xl font-semibold">{company.name}</h1>

        <CompanyEditor company={company} />

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Contacts</h2>
          <ContactsTable companyId={company.id} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Applications</h2>
          <div>TODO: Integrate ApplicationTable (Block 11)</div>
        </div>
      </div>
    </MainLayout>
  );
}
