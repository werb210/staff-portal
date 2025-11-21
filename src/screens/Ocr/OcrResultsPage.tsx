import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { http } from "../../api/http";

export default function OcrResultsPage() {
  const { documentId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ocr", documentId],
    queryFn: () => http.get(`/api/ocr/results/${documentId}`),
    enabled: !!documentId,
  });

  if (isLoading) return <div>Loading OCR results...</div>;
  if (error) return <div>Error loading results.</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">OCR Results</h1>
      <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
