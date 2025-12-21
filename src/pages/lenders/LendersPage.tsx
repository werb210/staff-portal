import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import { fetchLenders } from "@/api/lenders";
import AppLoading from "@/components/layout/AppLoading";

const LendersPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["lenders"],
    queryFn: fetchLenders,
    onError: (err) => console.error("Failed to load lenders", err)
  });

  return (
    <div className="page">
      <Card title="Lenders">
        {isLoading && <AppLoading />}
        {error && <p className="text-red-700">Unable to load lenders.</p>}
        {!isLoading && !error && (
          <Table headers={["Name", "Region"]}>
            {data?.map((lender) => (
              <tr key={lender.id}>
                <td>{lender.name}</td>
                <td>{lender.region}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={2}>No lender profiles available.</td>
              </tr>
            )}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default LendersPage;
