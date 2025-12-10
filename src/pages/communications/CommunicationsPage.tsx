import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import AppLoading from "@/components/layout/AppLoading";
import { fetchCommunicationThreads } from "@/api/communications";

const CommunicationsPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ["communications", "threads"], queryFn: fetchCommunicationThreads });

  return (
    <div className="page">
      <Card title="Communications">
        {isLoading && <AppLoading />}
        {!isLoading && (
          <Table headers={["Subject", "Updated"]}>
            {data?.map((thread) => (
              <tr key={thread.id}>
                <td>{thread.subject}</td>
                <td>{new Date(thread.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={2}>No communications yet.</td>
              </tr>
            )}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default CommunicationsPage;
