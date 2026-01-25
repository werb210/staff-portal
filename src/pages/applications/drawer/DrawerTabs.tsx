import type { ReactNode } from "react";
import clsx from "clsx";

export type DrawerTabId =
  | "overview"
  | "business"
  | "applicant"
  | "financial"
  | "product-fit"
  | "documents"
  | "messages"
  | "audit"
  | "lenders";

export type DrawerTab = {
  id: DrawerTabId;
  label: string;
  badge?: ReactNode;
};

export const TABS: DrawerTab[] = [
  { id: "overview", label: "Overview" },
  { id: "business", label: "Business Details" },
  { id: "applicant", label: "Applicant Details" },
  { id: "financial", label: "Financial Profile" },
  { id: "product-fit", label: "Product Fit / Match" },
  { id: "documents", label: "Documents" },
  { id: "messages", label: "Messages" },
  { id: "audit", label: "Audit / Timeline" },
  { id: "lenders", label: "Lenders" }
];

type DrawerTabsProps = {
  tabs: DrawerTab[];
  selectedTab: DrawerTabId;
  onSelect: (tab: DrawerTabId) => void;
};

const DrawerTabs = ({ tabs, selectedTab, onSelect }: DrawerTabsProps) => (
  <div className="application-drawer__tabs">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={clsx("application-drawer__tab", { active: selectedTab === tab.id })}
        onClick={() => onSelect(tab.id)}
        type="button"
      >
        <span>{tab.label}</span>
        {tab.badge ? <span className="application-drawer__tab-badge">{tab.badge}</span> : null}
      </button>
    ))}
  </div>
);

export default DrawerTabs;
