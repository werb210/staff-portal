import type { ReactNode } from "react";
import clsx from "clsx";

export type DrawerTabId =
  | "application"
  | "financials"
  | "banking"
  | "credit-summary"
  | "documents"
  | "notes"
  | "lenders";

export type DrawerTab = {
  id: DrawerTabId;
  label: string;
  badge?: ReactNode;
};

export const TABS: DrawerTab[] = [
  { id: "application", label: "Application" },
  { id: "financials", label: "Financials (OCR output)" },
  { id: "banking", label: "Banking Analysis (bank OCR)" },
  { id: "credit-summary", label: "Credit Summary" },
  { id: "documents", label: "Documents" },
  { id: "notes", label: "Notes (internal staff only)" },
  { id: "lenders", label: "Lender Matching" }
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
