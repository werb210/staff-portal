import Button from "@/components/ui/Button";
import type { Company } from "@/api/crm";

interface CompanyRowProps {
  company: Company;
  onSelect: (company: Company) => void;
}

const CompanyRow = ({ company, onSelect }: CompanyRowProps) => (
  <tr data-testid={`company-row-${company.id}`}>
    <td>{company.name}</td>
    <td>{company.industry}</td>
    <td>{company.silo}</td>
    <td>{company.owner}</td>
    <td>{company.tags.join(", ")}</td>
    <td>
      <Button onClick={() => onSelect(company)}>Details</Button>
    </td>
  </tr>
);

export default CompanyRow;
