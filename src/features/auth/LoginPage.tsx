import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useSessionStore } from "@/store/sessionStore";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/authService";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginInput = z.infer<typeof loginSchema>;

const ROLE_REDIRECT: Record<string, string> = {
  admin: "/admin",
  staff: "/dashboard",
  marketing: "/marketing",
  lender: "/lender",
  referrer: "/referrer",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const session = useSessionStore();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      session.setSession({ user: data.user, token: data.token, expiresAt: data.expiresAt });
      const from = (location.state as any)?.from?.pathname;
      const redirectTo = ROLE_REDIRECT[data.user.role] ?? "/dashboard";
      navigate(from || redirectTo, { replace: true });
      addToast({ title: "Signed in", description: `Welcome back ${data.user.name}`, variant: "success" });
    },
    onError: () => addToast({ title: "Login failed", description: "Check your credentials", variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Sign in to Staff Portal</CardTitle>
          <p className="text-sm text-muted-foreground">Modern authentication with role awareness.</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot-password" className="text-slate-900 underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
