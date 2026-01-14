import PipelinePage from "./pipeline/PipelinePage";
import SLFPipelinePage from "./slf/SLFPipelinePage";
import { useSilo } from "@/hooks/useSilo";
import RequireRole from "@/components/auth/RequireRole";

const ApplicationsContent = () => {
  const { silo } = useSilo();

  if (silo === "SLF") {
    return <SLFPipelinePage />;
  }

  return <PipelinePage />;
};

const ApplicationsPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <ApplicationsContent />
  </RequireRole>
);

export default ApplicationsPage;
