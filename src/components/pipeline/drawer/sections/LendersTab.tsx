import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePipelineDrawer } from "@/hooks/pipelineDrawer";
import { useApplicationDetails } from "@/hooks/applications";
import { cn } from "@/lib/utils";

import { PipelineCard } from "@/features/pipeline/PipelineTypes";

interface LendersTabProps {
  application: PipelineCard;
}

export function LendersTab({ application }: LendersTabProps) {
  return <ScrollArea className="h-[calc(100vh-120px)] p-4">{/* Section-specific content goes here */}</ScrollArea>;
}

export default LendersTab;
