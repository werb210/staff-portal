import { useAuthStore } from "../../lib/auth/useAuthStore";
import { Button } from "@/components/ui/button";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="w-full h-14 bg-white border-b shadow-sm flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">
          {user?.email || "Unknown User"}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
