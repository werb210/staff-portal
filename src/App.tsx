import { useMemo } from "react";

import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

const stats = [
  { label: "New Contacts", value: 128, trend: "+12%" },
  { label: "Active Deals", value: 42, trend: "+4%" },
  { label: "Pending Reviews", value: 18, trend: "-3%" },
  { label: "Documents", value: 312, trend: "+8%" },
];

const teamMembers = [
  { name: "Ashley Kim", role: "Relationship Manager", status: "Online" },
  { name: "Dev Patel", role: "Risk Lead", status: "Reviewing" },
  { name: "Morgan Lee", role: "Analyst", status: "Off duty" },
];

function quickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Create record</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start something new</DialogTitle>
            <DialogDescription>Capture the essentials and route the request to the right team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6 pb-6">
            <Input placeholder="Name" />
            <Input placeholder="Owner" />
          </div>
          <DialogFooter>
            <Button variant="secondary">Cancel</Button>
            <Button>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button variant="secondary" size="sm">
        Export report
      </Button>
    </div>
  );
}

function DashboardHero() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Badge>Operational overview</Badge>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600">Monitor the health of contacts, applications, and documents in one place.</p>
      </div>
      {quickActions()}
    </div>
  );
}

function StatCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle>{stat.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={stat.trend.startsWith("+") ? "success" : "warning"}>{stat.trend} vs last week</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest updates from the team across the portal.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.name}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === "Online" ? "success" : member.status === "Reviewing" ? "default" : "outline"}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TabsPanel() {
  const activeCount = useMemo(() => stats.reduce((total, item) => total + item.value, 0), []);

  return (
    <Tabs defaultValue="applications">
      <TabsList>
        <TabsTrigger value="applications">Applications</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
      </TabsList>
      <TabsContent value="applications">
        <p className="text-sm text-slate-700">
          Active applications across the pipeline: <span className="font-semibold text-slate-900">{activeCount}</span>.
        </p>
      </TabsContent>
      <TabsContent value="documents">
        <p className="text-sm text-slate-700">Document processing is on track with automated checks and OCR.</p>
      </TabsContent>
      <TabsContent value="contacts">
        <p className="text-sm text-slate-700">Engage recent contacts with follow-ups and segment by interest.</p>
      </TabsContent>
    </Tabs>
  );
}

function GuidanceAlert() {
  return (
    <Alert variant="info">
      <AlertTitle>Tip</AlertTitle>
      <AlertDescription>
        Use the navigation to move between contacts, deals, applications, and documents without losing context.
      </AlertDescription>
    </Alert>
  );
}

function App() {
  return (
    <div className="space-y-6">
      <DashboardHero />
      <StatCards />
      <TabsPanel />
      <RecentTable />
      <GuidanceAlert />
    </div>
  );
}

export default App;
