import { useParams } from "react-router-dom";
import { useApplicationFull } from "./useApplicationFull";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useApplicationFull(id!);

  const [newNote, setNewNote] = useState("");

  if (isLoading) return <div>Loading application…</div>;
  if (error) return <div className="text-red-600">Failed to load application.</div>;

  const a = data;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card>
        <CardHeader>
          <CardTitle>{a.businessName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Contact: {a.contactName} • Status: {a.status}
          </p>
        </CardHeader>
      </Card>

      {/* DOCUMENTS */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {a.documents.map((doc: any) => (
              <div key={doc.id} className="p-3 border rounded">
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.category}</p>

                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={doc.s3Url} target="_blank">View</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* OCR SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>OCR Extracted Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {a.ocrFields.map((f: any) => (
              <div key={f.id} className="p-2 border rounded bg-muted">
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TIMELINE */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {a.timeline.map((t: any) => (
            <div key={t.id} className="p-3 border rounded">
              <p className="font-medium">{t.type}</p>
              <p className="text-sm">{t.message}</p>
              <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* NOTES */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {a.notes.map((n: any) => (
              <div key={n.id} className="p-3 border rounded">
                <p>{n.text}</p>
                <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}

            <Separator className="my-4" />

            {/* New Note Composer */}
            <Textarea
              placeholder="Add a new note…"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />

            <Button className="mt-2">Save Note</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
