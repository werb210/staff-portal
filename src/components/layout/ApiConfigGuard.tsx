import type { PropsWithChildren } from "react";
import Card from "@/components/ui/Card";
import { RUNTIME_ENV } from "@/config/runtime";

const ApiConfigGuard = ({ children }: PropsWithChildren) => {
  if (!RUNTIME_ENV.API_BASE_URL) {
    return (
      <div className="page">
        <Card title="Configuration error">
          <p>The staff portal is missing the API base URL.</p>
          <p>Set API_BASE_URL in the runtime configuration to continue.</p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiConfigGuard;
