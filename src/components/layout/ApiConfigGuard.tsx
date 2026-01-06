import type { PropsWithChildren } from "react";
import Card from "@/components/ui/Card";
import { getApiBaseUrlOptional } from "@/config/runtime";

const ApiConfigGuard = ({ children }: PropsWithChildren) => {
  if (!getApiBaseUrlOptional()) {
    return (
      <div className="page">
        <Card title="Configuration error">
          <p>The staff portal is missing the API base URL.</p>
          <p>Set VITE_API_BASE_URL in the runtime configuration to continue.</p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiConfigGuard;
