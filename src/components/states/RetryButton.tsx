import { Button } from "@/components/ui/button";

interface Props {
  onRetry: () => void;
  label?: string;
}

export default function RetryButton({ onRetry, label = "Retry" }: Props) {
  return (
    <Button variant="outline" onClick={onRetry} className="mt-3">
      {label}
    </Button>
  );
}
