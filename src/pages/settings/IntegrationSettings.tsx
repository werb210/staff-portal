import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  twilio: z.string().optional(),
  sendgrid: z.string().optional(),
  linkedin: z.string().optional(),
  googleAds: z.string().optional(),
  azureBlob: z.string().optional(),
  openai: z.string().optional(),
});

type InputType = z.infer<typeof schema>;

export default function IntegrationSettings() {
  const { addToast } = useToast();
  const form = useForm<InputType>({ resolver: zodResolver(schema), defaultValues: {} });

  const testEndpoint = (path: string) =>
    fetch(path, { method: "POST" })
      .then(() => addToast({ title: "Test triggered", description: path, variant: "success" }))
      .catch(() => addToast({ title: "Test failed", description: path, variant: "destructive" }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => addToast({ title: "Integrations saved", description: JSON.stringify(values) }))} className="space-y-4">
            {(
              [
                ["twilio", "Twilio"],
                ["sendgrid", "SendGrid"],
                ["linkedin", "LinkedIn API"],
                ["googleAds", "Google Ads"],
                ["azureBlob", "Azure Blob Storage"],
                ["openai", "OpenAI API key"],
              ] as const
            ).map(([key, label]) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{label}</FormLabel>
                      <Button type="button" variant="outline" size="sm" onClick={() => testEndpoint(`/api/integrations/${key}/test`)}>
                        Test integration
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder={`${label} token`} {...field} />
                    </FormControl>
                    <FormMessage>{form.formState.errors[key]?.message as string}</FormMessage>
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit">Save settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
