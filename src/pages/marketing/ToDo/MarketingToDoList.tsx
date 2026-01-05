import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useMarketingStore } from "@/state/marketing.store";

const MarketingToDoList = () => {
  const { todos, toggleTodo, addTodo } = useMarketingStore();

  return (
    <Card
      title="Marketing To-Do"
      actions={
        <Button
          onClick={() => addTodo({ title: "Refresh retargeting audiences", assignedTo: "Casey" })}
        >
          Add task
        </Button>
      }
    >
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between">
            <div>
              <div className={`font-semibold ${todo.completed ? "line-through text-muted" : ""}`}>{todo.title}</div>
              {todo.assignedTo && <div className="text-xs text-muted">Assigned to {todo.assignedTo}</div>}
            </div>
            <Button variant="ghost" onClick={() => toggleTodo(todo.id)}>
              {todo.completed ? "Reopen" : "Complete"}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default MarketingToDoList;
