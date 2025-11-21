import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  bio: z.string().optional(),
  twoFactor: z.boolean().optional(),
});

type InputType = z.infer<typeof schema>;

export default function ProfileSettings() {
  const { addToast } = useToast();
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: { name: "Alex Manager", email: "alex@staffportal.com", twoFactor: true, bio: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => addToast({ title: "Profile updated", description: values.email, variant: "success" }))}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.bio?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twoFactor"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Two-factor authentication</FormLabel>
                    <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                </FormItem>
              )}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
