import { useState } from 'react';
import ApplicationData from './tabs/ApplicationData';
import Banking from './tabs/Banking';
import Financials from './tabs/Financials';
import Documents from './tabs/Documents';
import Lenders from './tabs/Lenders';
import AISummary from './tabs/AISummary';

interface ApplicationDrawerProps {
  applicationId: string;
}

const TABS = [
  { id: 'application', label: 'Application', component: ApplicationData },
  { id: 'banking', label: 'Banking', component: Banking },
  { id: 'financials', label: 'Financials', component: Financials },
  { id: 'documents', label: 'Documents', component: Documents },
  { id: 'lenders', label: 'Lenders', component: Lenders },
  { id: 'ai', label: 'AI Summary', component: AISummary },
];

const ApplicationDrawer = ({ applicationId }: ApplicationDrawerProps) => {
  const [activeTab, setActiveTab] = useState('application');

  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component ?? ApplicationData;

  return (
    <div className="drawer-tabs">
      <nav className="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="tab-content">
        <ActiveComponent applicationId={applicationId} />
      </div>
    </div>
  );
};

export default ApplicationDrawer;
