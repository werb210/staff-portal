import { useQuery } from "@tanstack/react-query";
import { getOcrInsights } from "./ApplicationService";

export default function OcrTab({ appId }: { appId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["ocr", appId],
    queryFn: () => getOcrInsights(appId),
  });

  if (isLoading) return <p>Loading OCR insights…</p>;

  return (
    <pre className="bg-gray-900 text-green-300 text-sm p-3 rounded overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
