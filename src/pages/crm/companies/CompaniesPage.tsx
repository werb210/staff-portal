import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import CompanyRow from "./CompanyRow";
import CompanyForm from "./CompanyForm";
import CompanyDetailsDrawer from "./CompanyDetailsDrawer";
import { fetchCompanies } from "@/api/crm";
import type { Company } from "@/api/crm";
import { useCrmStore } from "@/state/crm.store";

const CompaniesPage = () => {
  const { silo, setSilo } = useCrmStore();
  const [selected, setSelected] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const { data: companies = [] } = useQuery({ queryKey: ["companies", silo], queryFn: fetchCompanies });

  const filtered = companies.filter(
    (company) =>
      !search || company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page" data-testid="companies-page">
      <Card
        title="Companies"
        actions={
          <div className="flex gap-2">
            <Select value={silo} onChange={(e) => setSilo(e.target.value as any)}>
              <option value="BF">BF</option>
              <option value="BI">BI</option>
              <option value="SLF">SLF</option>
            </Select>
            <Button onClick={() => setShowForm(true)}>Add Company</Button>
          </div>
        }
      >
        <div className="flex gap-2 mb-2 items-center">
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Table headers={["Name", "Industry", "Silo", "Owner", "Tags", "Actions"]}>
          {filtered.map((company) => (
            <CompanyRow key={company.id} company={company} onSelect={setSelected} />
          ))}
        </Table>
      </Card>
      {showForm && (
        <Card title="New Company" actions={<Button onClick={() => setShowForm(false)}>Close</Button>}>
          <CompanyForm onSave={() => setShowForm(false)} />
        </Card>
      )}
      <CompanyDetailsDrawer company={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default CompaniesPage;
