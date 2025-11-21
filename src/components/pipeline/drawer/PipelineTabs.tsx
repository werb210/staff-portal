import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePipelineDrawer } from "@/hooks/pipelineDrawer";
import { useApplicationDetails } from "@/hooks/applications";
import { cn } from "@/lib/utils";

import { PipelineCard } from "@/features/pipeline/PipelineTypes";
import { ApplicationTab } from "./sections/ApplicationTab";
import { BankingTab } from "./sections/BankingTab";
import { FinancialsTab } from "./sections/FinancialsTab";
import { DocumentsTab } from "./sections/DocumentsTab";
import { LendersTab } from "./sections/LendersTab";

interface PipelineTabsProps {
  application: PipelineCard;
}

export function PipelineTabs({ application }: PipelineTabsProps) {
  return (
    <Tabs defaultValue="application">
      <TabsList>
        <TabsTrigger value="application">Application</TabsTrigger>
        <TabsTrigger value="banking">Banking</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="lenders">Lenders</TabsTrigger>
      </TabsList>
      <TabsContent value="application">
        <ApplicationTab application={application} />
      </TabsContent>
      <TabsContent value="banking">
        <BankingTab application={application} />
      </TabsContent>
      <TabsContent value="financials">
        <FinancialsTab application={application} />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsTab application={application} />
      </TabsContent>
      <TabsContent value="lenders">
        <LendersTab application={application} />
      </TabsContent>
    </Tabs>
  );
}

export default PipelineTabs;
