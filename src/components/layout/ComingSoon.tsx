import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface ComingSoonProps {
  feature: string;
}

export function ComingSoon({ feature }: ComingSoonProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{feature}</CardTitle>
          <CardDescription>The {feature.toLowerCase()} area is on the way. Check back soon.</CardDescription>
        </CardHeader>
        <CardContent className="text-slate-700">
          We&apos;re building this experience now. In the meantime, you can continue working in other sections of the
          portal.
        </CardContent>
      </Card>
    </div>
  );
}
