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
        <ApplicationCard tabs={TABS} selectedTab={selectedTab} onSelect={handleTabChange}>
          <div className="application-drawer__content">{tabContentMap[selectedTab]}</div>
        </ApplicationCard>
      </div>
    </div>
  );
};

export default ApplicationDrawer;
