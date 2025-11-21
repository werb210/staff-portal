import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePipelineDrawer } from "@/hooks/pipelineDrawer";
import { useApplicationDetails } from "@/hooks/applications";
import { cn } from "@/lib/utils";

import { PipelineTabs } from "./PipelineTabs";

export function PipelineDrawer() {
  const drawer = usePipelineDrawer();
  const { data: application } = useApplicationDetails(drawer.applicationId);

  return (
    <Sheet open={drawer.isOpen} onOpenChange={drawer.close}>
      <SheetContent side="right" className="w-[600px] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>{application?.businessName}</SheetTitle>
        </SheetHeader>
        {application && <PipelineTabs application={application} />}
      </SheetContent>
    </Sheet>
  );
}

export default PipelineDrawer;
