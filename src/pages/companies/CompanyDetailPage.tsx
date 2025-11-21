import { useNavigate, useParams } from "react-router-dom";
import CompanyDrawer from "@/features/companies/CompanyDrawer";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <CompanyDrawer
      companyId={id ?? ""}
      open
      onClose={() => navigate(-1)}
    />
  );
}
