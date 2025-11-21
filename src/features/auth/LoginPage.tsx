import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { loginSchema, LoginInput } from "./loginSchema";
import { useLogin } from "./useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth/useAuthStore";

const ROLE_REDIRECT: Record<string, string> = {
  Admin: "/admin",
  Staff: "/pipeline",
  Lender: "/lender",
  Referrer: "/referrer",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuthStore();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useLogin();

  useEffect(() => {
    if (token && user?.role) {
      const fallback = "/pipeline";
      navigate(ROLE_REDIRECT[user.role] ?? fallback, { replace: true });
    }
  }, [navigate, token, user]);

  function submit(values: LoginInput) {
    login.mutate(values, {
      onSuccess: (result) => {
        const role = result.role;
        const redirectTo = ROLE_REDIRECT[role] ?? "/pipeline";
        const from = (location.state as any)?.from?.pathname;
        navigate(from || redirectTo, { replace: true });
      },
    });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Staff Portal Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm mb-1 font-medium">Email</label>
              <Input
                type="email"
                {...form.register("email")}
                disabled={login.isPending}
              />
              {form.formState.errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Password</label>
              <Input
                type="password"
                {...form.register("password")}
                disabled={login.isPending}
              />
              {form.formState.errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {login.isError && (
              <p className="text-red-600 text-sm">
                Invalid credentials. Try again.
              </p>
            )}

            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full mt-2"
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
