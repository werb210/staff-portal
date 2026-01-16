import type { ReactNode } from "react";
import DrawerTabs, { type DrawerTab, type DrawerTabId } from "./drawer/DrawerTabs";

type ApplicationCardProps = {
  tabs: DrawerTab[];
  selectedTab: DrawerTabId;
  onSelect: (tab: DrawerTabId) => void;
  children: ReactNode;
};

const ApplicationCard = ({ tabs, selectedTab, onSelect, children }: ApplicationCardProps) => (
  <div className="application-card">
    <DrawerTabs tabs={tabs} selectedTab={selectedTab} onSelect={onSelect} />
    <div className="application-card__content">{children}</div>
  </div>
);

export default ApplicationCard;
