import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/authService";
import { useToast } from "@/components/ui/toast";
import LoadingOverlay from "@/components/feedback/LoadingOverlay";

export default function LogoutPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    logout().then(() => {
      addToast({ title: "Signed out", description: "Session cleared" });
      navigate("/login", { replace: true });
    });
  }, [addToast, navigate]);

  return <LoadingOverlay message="Signing out" />;
}
