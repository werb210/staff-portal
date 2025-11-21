import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { listContacts } from "../core/endpoints/contacts.api";
import { usePortalState } from "../core/view.store";

interface ContactRecord {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  status?: string;
  tags?: string[];
}

interface ContactListResponse {
  items?: ContactRecord[];
  data?: ContactRecord[];
}

const fallbackContacts: ContactRecord[] = [
  { id: "1", name: "Harper Elliot", email: "harper@example.com", company: "Northwind", status: "Active", tags: ["VIP"] },
  {
    id: "2",
    name: "Priya Nair",
    email: "priya@example.com",
    company: "Lighthouse",
    status: "Prospect",
    tags: ["Follow-up", "New"],
  },
  { id: "3", name: "Diego Costa", email: "diego@example.com", company: "Aurora", status: "Dormant", tags: ["Watch"] },
];

export default function ContactsPage() {
  const { searchTerm, setSearchTerm } = usePortalState();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["contacts", searchTerm],
    queryFn: async () => (await listContacts<ContactListResponse>({ search: searchTerm || undefined })).data,
    staleTime: 30_000,
    retry: 1,
  });

  const contacts = useMemo(() => data?.items ?? data?.data ?? fallbackContacts, [data]);

  return (
    <PageLayout
      title="Contacts"
      description="Manage contact records with live data from the unified API."
      badge="Customer data"
      actions={
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search contacts"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-64"
          />
          <Button variant="secondary" onClick={() => setSearchTerm("")}>Clear</Button>
        </div>
      }
    >
      <PageSection
        title="People"
        description="Synced with the contacts service"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Loading" : "Synced"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Unable to load contacts</CardTitle>
              <CardDescription>Check the API layer and retry.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id ?? contact.email}>
                  <TableCell className="font-semibold">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{contact.status ?? "Unknown"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>
    </PageLayout>
  );
}
