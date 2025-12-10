import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppLoading from "@/components/layout/AppLoading";
import LenderLayout from "@/lender/layout/LenderLayout";
import LenderLoginPage from "@/lender/auth/LenderLoginPage";
import LenderOtpPage from "@/lender/auth/LenderOtpPage";
import LenderDashboard from "@/lender/dashboard/LenderDashboard";
import CompanyEditor from "@/lender/company/CompanyEditor";
import ProductsPage from "@/lender/products/ProductsPage";
import { LenderAuthProvider } from "@/lender/auth/LenderAuthContext";
import { useLenderAuth } from "@/lender/auth/useLenderAuth";

const LenderPrivateRoute = () => {
  const { isAuthenticated, isLoading } = useLenderAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="route-guard">
        <AppLoading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/lender/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const LenderRoutes = () => (
  <LenderAuthProvider>
    <Routes>
      <Route path="/lender/login" element={<LenderLoginPage />} />
      <Route path="/lender/otp" element={<LenderOtpPage />} />
      <Route element={<LenderPrivateRoute />}>
        <Route path="/lender" element={<LenderLayout />}>
          <Route index element={<Navigate to="/lender/dashboard" replace />} />
          <Route path="/lender/dashboard" element={<LenderDashboard />} />
          <Route path="/lender/company" element={<CompanyEditor />} />
          <Route path="/lender/products" element={<ProductsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/lender/login" replace />} />
    </Routes>
  </LenderAuthProvider>
);

export default LenderRoutes;
