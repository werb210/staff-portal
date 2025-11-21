import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const marketingStats = [
  { label: "Open rate", value: 62 },
  { label: "SMS reply", value: 44 },
  { label: "Ads conversions", value: 18 },
  { label: "CAC", value: 320 },
];

export default function MarketingAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Campaign performance</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketingStats}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Campaign-level stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-md bg-slate-100 p-3">
            <span>Email open rate</span>
            <strong>62%</strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-slate-100 p-3">
            <span>SMS reply rate</span>
            <strong>44%</strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-slate-100 p-3">
            <span>CAC</span>
            <strong>$320</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
