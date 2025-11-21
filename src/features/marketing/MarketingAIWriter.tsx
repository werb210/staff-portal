import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

export default function MarketingAIWriter() {
  const [prompt, setPrompt] = useState("Generate a drip sequence for new leads");
  const [output, setOutput] = useState("Ready to generate tailored outreach.");
  const { addToast } = useToast();

  function generate(mode: string) {
    setOutput(`${mode} generated for: ${prompt}`);
    addToast({ title: "AI draft ready", description: mode, variant: "success" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Writer</h1>
        <p className="text-gray-600">Drip sequences, LinkedIn outreach, rewrites, and tone changes.</p>
      </div>
      <Tabs defaultValue="drip">
        <TabsList>
          <TabsTrigger value="drip">Drip sequences</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn outreach</TabsTrigger>
          <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
          <TabsTrigger value="summary">Summaries</TabsTrigger>
        </TabsList>
        {(["drip", "linkedin", "rewrite", "summary"] as const).map((mode) => (
          <TabsContent key={mode} value={mode}>
            <Card className="p-4 space-y-3">
              <textarea
                className="w-full rounded border px-3 py-2 text-sm"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => generate(mode)}>Generate</Button>
                <Button variant="secondary">Save template</Button>
              </div>
              <pre className="bg-slate-50 p-3 rounded text-sm whitespace-pre-wrap">{output}</pre>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
