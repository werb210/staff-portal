import { useQuery } from "@tanstack/react-query";
import { getOcrInsights } from "./ApplicationService";
import { OcrInsights } from "./ApplicationTypes";

type OcrTabProps = {
  appId: string;
};

export default function OcrTab({ appId }: OcrTabProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<OcrInsights>({
    queryKey: ["ocr", appId],
    queryFn: () => getOcrInsights(appId),
    enabled: Boolean(appId),
  });

  if (isLoading) return <p>Loading OCR insights…</p>;

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return <p className="text-red-600">Failed to load OCR data: {message}</p>;
  }

  return (
    <pre className="bg-gray-900 text-green-300 text-sm p-3 rounded overflow-auto max-h-[540px]">
      {JSON.stringify(data ?? {}, null, 2)}
    </pre>
  );
}
