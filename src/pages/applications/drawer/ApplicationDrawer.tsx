import { useEffect, useRef } from "react";
import DrawerHeader from "./DrawerHeader";
import { TABS, type DrawerTabId } from "./DrawerTabs";
import ApplicationCard from "@/pages/applications/ApplicationCard";
import OverviewTab from "./tab-overview/OverviewTab";
import BusinessDetailsTab from "./tab-business/BusinessDetailsTab";
import ApplicantDetailsTab from "./tab-applicant/ApplicantDetailsTab";
import FinancialProfileTab from "./tab-financial-profile/FinancialProfileTab";
import ProductFitTab from "./tab-product-fit/ProductFitTab";
import DocumentsTab from "./tab-documents/DocumentsTab";
import MessagesTab from "./tab-messages/MessagesTab";
import AuditTimelineTab from "./tab-audit/AuditTimelineTab";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { usePipelineStore } from "@/pages/applications/pipeline/pipeline.store";

const tabContentMap: Record<DrawerTabId, JSX.Element> = {
  overview: <OverviewTab />,
  business: <BusinessDetailsTab />,
  applicant: <ApplicantDetailsTab />,
  financial: <FinancialProfileTab />,
  "product-fit": <ProductFitTab />,
  documents: <DocumentsTab />,
  messages: <MessagesTab />,
  audit: <AuditTimelineTab />
};

const ApplicationDrawer = () => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const { selectedTab, setTab } = useApplicationDrawerStore();
  const isOpen = usePipelineStore((state) => state.isDrawerOpen);
  const selectedApplicationId = usePipelineStore((state) => state.selectedApplicationId);
  const closeDrawer = usePipelineStore((state) => state.closeDrawer);
  const tabOrder = TABS.map((tab) => tab.id);
  const selectedIndex = tabOrder.indexOf(selectedTab);
  const previousTab = selectedIndex > 0 ? tabOrder[selectedIndex - 1] : null;

  useEffect(() => {
    useApplicationDrawerStore.setState({
      isOpen,
      selectedApplicationId
    });
  }, [isOpen, selectedApplicationId]);

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
        <ApplicationCard tabs={TABS} selectedTab={selectedTab} onSelect={handleTabChange}>
          <div className="application-drawer__content">{tabContentMap[selectedTab]}</div>
        </ApplicationCard>
      </div>
    </div>
  );
};

export default ApplicationDrawer;
