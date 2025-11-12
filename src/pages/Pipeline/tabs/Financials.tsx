import { usePipelineApplication } from '../../../hooks/usePipeline';
import { Spinner } from '../../../components/common/Spinner';

interface FinancialsProps {
  applicationId: string;
}

const Financials = ({ applicationId }: FinancialsProps) => {
  const { data, isLoading } = usePipelineApplication(applicationId);

  if (isLoading) {
    return <Spinner />;
  }

  const financials = data?.financials ?? {};

  return (
    <div className="tab-panel">
      <h3>Financial Snapshot</h3>
      <dl>
        <dt>Revenue (TTM)</dt>
        <dd>${financials.revenue?.toLocaleString?.() ?? financials.revenue ?? 'N/A'}</dd>
        <dt>Net Income</dt>
        <dd>${financials.netIncome?.toLocaleString?.() ?? financials.netIncome ?? 'N/A'}</dd>
        <dt>Debt Service Coverage</dt>
        <dd>{financials.dscr ?? 'N/A'}</dd>
      </dl>
    </div>
  );
};

export default Financials;
