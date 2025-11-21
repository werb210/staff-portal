import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export default function LoadingState({ label = "Loading data" }: { label?: string }) {
  return (
    <Alert className="border-slate-200 bg-white">
      <AlertTitle>{label}</AlertTitle>
      <AlertDescription className="text-slate-600">Please wait while we fetch the latest info.</AlertDescription>
    </Alert>
  );
}
