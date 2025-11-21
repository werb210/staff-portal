import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

const responseTime = [
  { label: "Lender A", value: 4 },
  { label: "Lender B", value: 6 },
  { label: "Lender C", value: 3 },
];

export default function LenderAnalytics() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Response time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={responseTime}>
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
          <CardTitle>Funding amounts trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[{ month: "Jan", value: 120000 }, { month: "Feb", value: 140000 }, { month: "Mar", value: 110000 }]}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
