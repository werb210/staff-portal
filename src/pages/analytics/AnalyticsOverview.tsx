import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

const weeklyApps = [
  { week: "W1", value: 24 },
  { week: "W2", value: 32 },
  { week: "W3", value: 40 },
  { week: "W4", value: 28 },
];

const docRate = [
  { name: "Completed", value: 72 },
  { name: "Pending", value: 28 },
];

export default function AnalyticsOverview() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>New applications per week</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyApps}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Docs completed rate</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={docRate} dataKey="value" nameKey="name" fill="#0f172a" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approval probability</CardTitle>
          </CardHeader>
          <CardContent className="flex h-56 items-center justify-center text-4xl font-semibold text-emerald-600">
            72%
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stage conversion funnel</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ stage: "Submitted", value: 120 }, { stage: "Docs", value: 90 }, { stage: "Review", value: 65 }, { stage: "Approved", value: 45 }]}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
