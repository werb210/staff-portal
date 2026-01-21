import { useMemo } from "react";
import Card from "@/components/ui/Card";
import { getRoleLabel, type UserRole } from "@/utils/roles";

const defaultMessage = "You do not have permission to view this page.";

type AccessRestrictedProps = {
  message?: string;
  requiredRoles?: UserRole[];
};

const AccessRestricted = ({
  message = defaultMessage,
  requiredRoles = []
}: AccessRestrictedProps) => {
  const roleLabel = useMemo(
    () => requiredRoles.map((role) => getRoleLabel(role)).join(", "),
    [requiredRoles]
  );

  return (
    <div className="page">
      <Card title="Access restricted">
        <p>{message}</p>
        {requiredRoles.length > 0 ? (
          <p className="text-sm text-slate-500">Required roles: {roleLabel}.</p>
        ) : null}
      </Card>
    </div>
  );
};

export default AccessRestricted;
