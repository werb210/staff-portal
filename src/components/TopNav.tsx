import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

export default function TopNav() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="w-full h-14 flex items-center justify-end px-6 border-b bg-white">
      <button
        className="px-4 py-2 bg-black text-white rounded"
        onClick={async () => {
          await logout();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
