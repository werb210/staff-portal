import MainLayout from "../layout/MainLayout";
import CompaniesTable from "../components/companies/CompaniesTable";

export default function CompaniesPage() {
  return (
    <MainLayout>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <p className="text-gray-700">Track organizations and related records.</p>
        <CompaniesTable />
      </div>
    </MainLayout>
  );
}
