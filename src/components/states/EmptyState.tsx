import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface Props {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = "No results",
  message = "There's nothing to display yet.",
}: Props) {
  return (
    <Alert className="border-slate-200 bg-white">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
