import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/authService";
import { useToast } from "@/components/ui/toast";
import { useNavigate, useParams } from "react-router-dom";

const schema = z
  .object({
    password: z.string().min(8),
    confirm: z.string().min(8),
  })
  .refine((vals) => vals.password === vals.confirm, { path: ["confirm"], message: "Passwords must match" });

type InputType = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const form = useForm<InputType>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  const mutation = useMutation({
    mutationFn: (values: InputType) => resetPassword({ token: token ?? "", password: values.password }),
    onSuccess: () => {
      addToast({ title: "Password reset", description: "You can now log in", variant: "success" });
      navigate("/login");
    },
    onError: () => addToast({ title: "Reset failed", description: "Link invalid", variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Reset password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.confirm?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                Reset password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
