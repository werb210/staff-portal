import RequireRole from "@/components/auth/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <RequireRole roles={["admin"]}>
      <Card>
        <CardHeader>
          <CardTitle>Admin workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Restricted admin-only content.</p>
        </CardContent>
      </Card>
    </RequireRole>
  );
}
