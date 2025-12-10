import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import AppLoading from "@/components/layout/AppLoading";
import { fetchTasks } from "@/api/tasks";

const CalendarPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks, staleTime: 30_000 });

  return (
    <div className="page">
      <Card title="Calendar & Tasks">
        {isLoading && <AppLoading />}
        {!isLoading && (
          <Table headers={["Task", "Due", "Status"]}>
            {data?.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                <td>{task.completed ? "Done" : "Open"}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={3}>No tasks scheduled.</td>
              </tr>
            )}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default CalendarPage;
