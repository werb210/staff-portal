import { usePipelineDocuments } from '../../../hooks/usePipeline';
import { Spinner } from '../../../components/common/Spinner';

interface DocumentsProps {
  applicationId: string;
}

const Documents = ({ applicationId }: DocumentsProps) => {
  const { data, isLoading } = usePipelineDocuments(applicationId);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="tab-panel">
      <h3>Documents</h3>
      <ul>
        {(data ?? []).map((document: any) => (
          <li key={document.id}>
            {document.name} • {document.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Documents;
