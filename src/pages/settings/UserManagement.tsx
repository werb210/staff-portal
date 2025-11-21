import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import RequireRole from "@/components/auth/RequireRole";

const users = [
  { id: "1", name: "Alex Manager", role: "admin", email: "alex@portal.com" },
  { id: "2", name: "Sara Staff", role: "staff", email: "sara@portal.com" },
  { id: "3", name: "Marty Marketing", role: "marketing", email: "marty@portal.com" },
];

export default function UserManagement() {
  const { addToast } = useToast();
  const rows = useMemo(() => users, []);

  return (
    <RequireRole roles={["admin"]}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>User management</CardTitle>
          <Button onClick={() => addToast({ title: "Invite sent", description: "New user invited", variant: "success" })}>
            Invite user
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => addToast({ title: "Role updated" })}>
                      Edit role
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => addToast({ title: "Reset password" })}>
                      Reset password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RequireRole>
  );
}
