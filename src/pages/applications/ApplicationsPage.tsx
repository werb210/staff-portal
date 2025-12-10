import PipelinePage from "./pipeline/PipelinePage";
import SLFPipelinePage from "./slf/SLFPipelinePage";
import { useSilo } from "@/hooks/useSilo";

const ApplicationsPage = () => {
  const { silo } = useSilo();

  if (silo === "SLF") {
    return <SLFPipelinePage />;
  }

  return <PipelinePage />;
};

export default ApplicationsPage;
