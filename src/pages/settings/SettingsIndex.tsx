import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { title: "Profile", description: "Manage your profile and security", to: "/settings/profile" },
  { title: "Users", description: "Invite and manage teammates", to: "/settings/users" },
  { title: "Integrations", description: "Connect external services", to: "/settings/integrations" },
];

export default function SettingsIndex() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sections.map((section) => (
        <Link key={section.to} to={section.to} className="block">
          <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
