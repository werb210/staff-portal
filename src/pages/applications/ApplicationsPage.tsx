import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import { useQuery } from "@tanstack/react-query";
import { fetchApplications } from "@/api/applications";
import AppLoading from "@/components/layout/AppLoading";
import Button from "@/components/ui/Button";

const ApplicationsPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ["applications"], queryFn: fetchApplications, staleTime: 60_000 });

  return (
    <div className="page">
      <Card title="Applications" actions={<Button variant="ghost">New Application</Button>}>
        {isLoading && <AppLoading />}
        {!isLoading && (
          <Table headers={["Applicant", "Status", "Submitted"]}>
            {data?.map((application) => (
              <tr key={application.id}>
                <td>{application.applicant}</td>
                <td>{application.status}</td>
                <td>{new Date(application.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={3}>No applications available.</td>
              </tr>
            )}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default ApplicationsPage;
