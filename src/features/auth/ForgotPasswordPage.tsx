import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/services/authService";
import { useToast } from "@/components/ui/toast";
import { Link } from "react-router-dom";

const schema = z.object({ email: z.string().email() });

type InputType = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const form = useForm<InputType>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => addToast({ title: "Email sent", description: "Check your inbox for reset link", variant: "success" }),
    onError: () => addToast({ title: "Unable to send", description: "Try again", variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Forgot password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                Send reset link
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remembered? <Link to="/login" className="underline">Back to login</Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
