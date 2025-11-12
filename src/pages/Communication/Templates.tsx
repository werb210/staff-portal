import { useState } from 'react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useTemplates } from '../../hooks/useTemplates';

const TemplatesPage = () => {
  const { listQuery, saveMutation } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: '', subject: '', body: '', type: 'email' });

  useEffect(() => {
    if (!selectedTemplate && (listQuery.data?.length ?? 0) > 0) {
      const firstTemplate = listQuery.data?.[0];
      if (firstTemplate) {
        setSelectedTemplate(firstTemplate.id);
        setFormState({
          name: firstTemplate.name,
          subject: firstTemplate.subject ?? '',
          body: firstTemplate.body,
          type: firstTemplate.type,
        });
      }
    }
  }, [listQuery.data, selectedTemplate]);

  const handleSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = listQuery.data?.find((item) => item.id === templateId);
    if (template) {
      setFormState({
        name: template.name,
        subject: template.subject ?? '',
        body: template.body,
        type: template.type,
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTemplate) return;
    saveMutation.mutate({
      id: selectedTemplate,
      name: formState.name,
      subject: formState.subject,
      body: formState.body,
      type: formState.type as 'sms' | 'email',
    });
  };

  return (
    <div className="communication-pane">
      <div className="grid two-columns">
        <aside className="card">
          <h3>Available Templates</h3>
          {listQuery.isLoading ? (
            <Spinner />
          ) : (
            <ul className="list">
              {(listQuery.data ?? []).map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(template.id)}
                    className={template.id === selectedTemplate ? 'active' : ''}
                  >
                    {template.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <form className="card form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          {formState.type === 'email' && (
            <label>
              Subject
              <input
                value={formState.subject}
                onChange={(event) => setFormState((prev) => ({ ...prev, subject: event.target.value }))}
              />
            </label>
          )}
          <label>
            Body
            <textarea
              value={formState.body}
              onChange={(event) => setFormState((prev) => ({ ...prev, body: event.target.value }))}
              required
            />
          </label>
          <Button type="submit" disabled={saveMutation.isPending || !selectedTemplate}>
            Save Template
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TemplatesPage;
