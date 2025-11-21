import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageLayout, PageSection } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getSettings } from "../core/endpoints/settings.api";

interface SettingsResponse {
  notifications?: boolean;
  timezone?: string;
  locale?: string;
  theme?: "light" | "dark" | "system";
}

const fallbackSettings: SettingsResponse = {
  notifications: true,
  timezone: "UTC",
  locale: "en-US",
  theme: "system",
};

export default function SettingsPage() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await getSettings<SettingsResponse>()).data,
    staleTime: 300_000,
    retry: 1,
  });

  const settings = useMemo(() => data ?? fallbackSettings, [data]);

  return (
    <PageLayout
      title="Settings"
      description="Preferences powered by the settings endpoint."
      badge="Profile"
      actions={<Badge variant="outline">Synced</Badge>}
    >
      <PageSection
        title="Account preferences"
        description="Read directly from the API layer"
        toolbar={<Badge variant={isLoading ? "warning" : "success"}>{isLoading ? "Loading" : "Ready"}</Badge>}
      >
        {isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle>Settings unavailable</CardTitle>
              <CardDescription>Unable to load preferences from the API.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-slate-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Email + in-app alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={settings.notifications ? "success" : "outline"}>
                  {settings.notifications ? "Enabled" : "Disabled"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">Locale</CardTitle>
                <CardDescription>Language and formatting</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{settings.locale}</span>
                <Badge variant="outline">Timezone: {settings.timezone}</Badge>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">Theme</CardTitle>
                <CardDescription>Light, dark, or system</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{settings.theme}</Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </PageSection>
    </PageLayout>
  );
}
