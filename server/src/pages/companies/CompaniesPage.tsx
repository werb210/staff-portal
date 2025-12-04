import CompaniesTable from "../../components/companies/CompaniesTable";
import MainLayout from "../../layout/MainLayout";

export default function CompaniesPage() {
  return (
    <MainLayout>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Companies</h2>
        <p className="text-gray-700">Track organizations and related records.</p>
        <CompaniesTable />
      </div>
    </MainLayout>
  );
}
