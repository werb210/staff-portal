import { usePipelineApplication } from '../../../hooks/usePipeline';
import { Spinner } from '../../../components/common/Spinner';

interface BankingProps {
  applicationId: string;
}

const Banking = ({ applicationId }: BankingProps) => {
  const { data, isLoading } = usePipelineApplication(applicationId);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="tab-panel">
      <h3>Banking</h3>
      <p>Connected Accounts</p>
      <ul>
        {(data?.bankAccounts ?? []).map((account: any) => (
          <li key={account.id}>
            {account.institution} • {account.type} ending in {account.last4}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Banking;
