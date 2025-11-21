import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import RetryButton from "./RetryButton";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data.",
  onRetry,
  children,
}: Props) {
  return (
    <Alert className="border-red-200 bg-red-50 text-red-800">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        {onRetry && <RetryButton onRetry={onRetry} />}
      </AlertDescription>
      {children}
    </Alert>
  );
}
