import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePipelineDetailStore } from "@/state/pipelineDetailStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import TabApplication from "@/components/pipeline/detail/TabApplication";
import TabBanking from "@/components/pipeline/detail/TabBanking";
import TabFinancials from "@/components/pipeline/detail/TabFinancials";
import TabDocuments from "@/components/pipeline/detail/TabDocuments";
import TabLenders from "@/components/pipeline/detail/TabLenders";

export default function PipelineDetail() {
  const { id } = useParams();
  const load = usePipelineDetailStore((s) => s.load);
  const app = usePipelineDetailStore((s) => s.app);
  const loading = usePipelineDetailStore((s) => s.loading);

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  if (loading || !app) {
    return (
      <div className="p-6">
        <div className="text-gray-700">Loading application...</div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">{app.businessName}</h1>

      <Tabs defaultValue="application" className="w-full">
        <TabsList>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="lenders">Lenders</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="application">
            <TabApplication />
          </TabsContent>

          <TabsContent value="banking">
            <TabBanking />
          </TabsContent>

          <TabsContent value="financials">
            <TabFinancials />
          </TabsContent>

          <TabsContent value="documents">
            <TabDocuments />
          </TabsContent>

          <TabsContent value="lenders">
            <TabLenders />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
