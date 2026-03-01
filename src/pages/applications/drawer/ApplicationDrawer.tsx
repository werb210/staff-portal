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
import OffersTab from "./OffersTab";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { usePipelineStore } from "@/pages/applications/pipeline/pipeline.store";
import { useAuth } from "@/hooks/useAuth";
import { resolveUserRole } from "@/utils/roles";
import { requireRole } from "@/auth/roleGuard";
import { canWrite } from "@/auth/can";
import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";
import CallHistoryTab from "@/components/CallHistoryTab";

const tabContentMap: Record<DrawerTabId, JSX.Element> = {
  application: <ApplicationTab />,
  financials: <FinancialTab />,
  banking: <BankingTab />,
  comms: <div className="drawer-placeholder">Communication history is available in the application shell.</div>,
  "credit-summary": <CreditSummaryTab />,
  documents: <DocumentsTab />,
  notes: <NotesTab />,
  offers: <OffersTab />,
  lenders: <LendersTab />,
  "call-history": <CallHistoryPanel />
};

const ApplicationDrawer = () => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const { selectedTab, setTab } = useApplicationDrawerStore();
  const isOpen = usePipelineStore((state) => state.isDrawerOpen);
  const selectedApplicationId = usePipelineStore((state) => state.selectedApplicationId);
  const closeDrawer = usePipelineStore((state) => state.closeDrawer);
  const { user } = useAuth();
  const normalizedUser = {
    role: resolveUserRole((user as { role?: string | null } | null)?.role ?? null)
  };
  const canViewStaffTabs = requireRole(normalizedUser, ["Admin", "Staff"]);
  const canEdit = canWrite(normalizedUser.role ?? null);
  const visibleTabs = useMemo(
    () =>
      TABS.filter((tab) => {
        if (!canEdit && (tab.id === "offers" || tab.id === "notes")) return false;
        if (!canViewStaffTabs && tab.id === "call-history") return false;
        return true;
      }),
    [canViewStaffTabs, canEdit]
  );
  const tabOrder = visibleTabs.map((tab) => tab.id);
  const defaultTab = tabOrder[0] ?? null;
  const activeTab = tabOrder.includes(selectedTab) ? selectedTab : defaultTab;
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
      const firstVisibleTab = visibleTabs[0];
      if (!firstVisibleTab) return;
      setTab(firstVisibleTab.id);
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



function CallHistoryPanel() {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const { data: applicationDetails } = useApplicationDetails();
  const { user } = useAuth();
  const normalizedUser = {
    role: resolveUserRole((user as { role?: string | null } | null)?.role ?? null)
  };

  if (!requireRole(normalizedUser, ["Admin", "Staff"])) {
    return null;
  }

  const detailsClientId =
    applicationDetails && typeof (applicationDetails as Record<string, unknown>).client_id === "string"
      ? ((applicationDetails as Record<string, unknown>).client_id as string)
      : null;
  const clientId = detailsClientId ?? applicationId;

  if (!clientId) return <div className="drawer-placeholder">Client not selected.</div>;

  return <CallHistoryTab clientId={clientId} />;
}

export default ApplicationDrawer;
