import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { useToast } from "@/components/ui/toast";
import LoadingOverlay from "@/components/feedback/LoadingOverlay";

export default function LogoutPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
    addToast({ title: "Signed out", description: "Session cleared" });
    navigate("/login", { replace: true });
  }, [addToast, logout, navigate]);

  return <LoadingOverlay message="Signing out" />;
}
