import { ReactNode } from "react";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface PageLayoutProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  children: ReactNode;
}

interface PageSectionProps {
  title: string;
  description?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ title, description, badge, actions, children }: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {badge ? <Badge>{badge}</Badge> : null}
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {description ? <p className="text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function PageSection({ title, description, toolbar, children }: PageSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {toolbar}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
