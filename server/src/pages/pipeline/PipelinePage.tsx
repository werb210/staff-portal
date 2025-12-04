import { useEffect, useState } from "react";
import { fetchPipeline } from "@/lib/api/pipeline";

export default function PipelinePage() {
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    fetchPipeline().then(setStages).catch(console.error);
  }, []);

  return (
    <>
      <h1>Pipeline</h1>
      <pre>{JSON.stringify(stages, null, 2)}</pre>
    </>
  );
}
