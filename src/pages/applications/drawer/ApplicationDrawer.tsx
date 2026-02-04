import { useEffect, useMemo, useRef } from "react";
import DrawerHeader from "./DrawerHeader";
import { TABS, type DrawerTabId } from "./DrawerTabs";
import ApplicationCard from "@/pages/applications/ApplicationCard";
import ApplicationTab from "./tab-application/ApplicationTab";
import FinancialTab from "./tab-financial/FinancialTab";
import BankingTab from "./tab-banking/BankingTab";
import CreditSummaryTab from "./tab-credit-summary/CreditSummaryTab";
import DocumentsTab from "./tab-documents/DocumentsTab";
import NotesTab from "./tab-notes/NotesTab";
import LendersTab from "./tab-lenders/LendersTab";
import OCRInsightsTab from "./tabs/OCRInsightsTab";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { usePipelineStore } from "@/pages/applications/pipeline/pipeline.store";
import { useAuth } from "@/hooks/useAuth";
import { canAccessStaffPortal } from "@/utils/roles";

const tabContentMap: Record<DrawerTabId, JSX.Element> = {
  application: <ApplicationTab />,
  financials: <FinancialTab />,
  banking: <BankingTab />,
  "ocr-insights": <OCRInsightsTab />,
  "credit-summary": <CreditSummaryTab />,
  documents: <DocumentsTab />,
  notes: <NotesTab />,
  lenders: <LendersTab />
};

const ApplicationDrawer = () => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const { selectedTab, setTab } = useApplicationDrawerStore();
  const isOpen = usePipelineStore((state) => state.isDrawerOpen);
  const selectedApplicationId = usePipelineStore((state) => state.selectedApplicationId);
  const closeDrawer = usePipelineStore((state) => state.closeDrawer);
  const { user } = useAuth();
  const isStaff = canAccessStaffPortal(user?.role);
  const visibleTabs = useMemo(
    () => (isStaff ? TABS : TABS.filter((tab) => tab.id !== "ocr-insights")),
    [isStaff]
  );
  const tabOrder = visibleTabs.map((tab) => tab.id);
  const activeTab = tabOrder.includes(selectedTab) ? selectedTab : tabOrder[0];
  const selectedIndex = activeTab ? tabOrder.indexOf(activeTab) : -1;
  const previousTab = selectedIndex > 0 ? tabOrder[selectedIndex - 1] : null;

  useEffect(() => {
    useApplicationDrawerStore.setState({
      isOpen,
      selectedApplicationId
    });
  }, [isOpen, selectedApplicationId]);

  useEffect(() => {
    if (visibleTabs.length === 0) return;
    if (!visibleTabs.some((tab) => tab.id === selectedTab)) {
      setTab(visibleTabs[0].id);
    }
  }, [selectedTab, setTab, visibleTabs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeDrawer();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeDrawer]);

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
        <DrawerHeader
          applicationId={selectedApplicationId}
          onBack={previousTab ? () => setTab(previousTab) : undefined}
          canGoBack={Boolean(previousTab)}
          onClose={closeDrawer}
        />
        <ApplicationCard tabs={visibleTabs} selectedTab={activeTab ?? selectedTab} onSelect={handleTabChange}>
          <div className="application-drawer__content">{activeTab ? tabContentMap[activeTab] : null}</div>
        </ApplicationCard>
      </div>
    </div>
  );
};

export default ApplicationDrawer;
