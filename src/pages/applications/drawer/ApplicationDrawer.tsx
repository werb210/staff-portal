import { useEffect, useRef } from "react";
import DrawerHeader from "./DrawerHeader";
import DrawerTabs, { TABS, type DrawerTabId } from "./DrawerTabs";
import ApplicationTab from "./tab-application/ApplicationTab";
import BankingTab from "./tab-banking/BankingTab";
import FinancialTab from "./tab-financial/FinancialTab";
import DocumentsTab from "./tab-documents/DocumentsTab";
import NotesTab from "./tab-notes/NotesTab";
import CreditSummaryTab from "./tab-credit-summary/CreditSummaryTab";
import LendersTab from "./tab-lenders/LendersTab";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";

const tabContentMap: Record<DrawerTabId, JSX.Element> = {
  application: <ApplicationTab />,
  banking: <BankingTab />,
  financial: <FinancialTab />,
  documents: <DocumentsTab />,
  notes: <NotesTab />,
  credit: <CreditSummaryTab />,
  lenders: <LendersTab />
};

const ApplicationDrawer = () => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const { isOpen, selectedApplicationId, selectedTab, setTab, close } = useApplicationDrawerStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleTabChange = (tab: DrawerTabId) => setTab(tab);

  if (!isOpen || !selectedApplicationId) return null;

  return (
    <div className="application-drawer-overlay" ref={overlayRef}>
      <div className="application-drawer" ref={drawerRef}>
        <DrawerHeader applicationId={selectedApplicationId} onClose={close} />
        <DrawerTabs tabs={TABS} selectedTab={selectedTab} onSelect={handleTabChange} />
        <div className="application-drawer__content">{tabContentMap[selectedTab]}</div>
      </div>
    </div>
  );
};

export default ApplicationDrawer;
