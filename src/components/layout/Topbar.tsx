import { useAuthStore } from "../../lib/auth/useAuthStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const { user, logout } = useAuthStore();

  return (
    <div className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="font-semibold text-lg">Staff Portal</div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-700">{user.email}</span>
          </div>
        )}

        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
