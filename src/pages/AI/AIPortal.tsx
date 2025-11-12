import { useState } from 'react';
import { useLenderMatching, useOCRExtraction, useRiskScoring, useSummarizeApplication } from '../../hooks/ai/useAI';
import type { LenderMatchSuggestion } from '../../types/ai';

export default function AIPortal() {
  const ocrMutation = useOCRExtraction();
  const summarizationMutation = useSummarizeApplication();
  const riskMutation = useRiskScoring();
  const matchMutation = useLenderMatching();
  const [suggestions, setSuggestions] = useState<LenderMatchSuggestion[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [risk, setRisk] = useState<string>('');
  const [ocr, setOcr] = useState<string>('');

  return (
    <div className="page ai">
      <section className="card">
        <header className="card__header">
          <h2>Document OCR</h2>
        </header>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            try {
              const result = await ocrMutation.mutateAsync({
                documentId: String(formData.get('documentId') ?? ''),
                fileUrl: String(formData.get('fileUrl') ?? ''),
              });
              setOcr(JSON.stringify(result, null, 2));
            } catch (error) {
              console.error('OCR request failed', error);
              setOcr('Unable to extract document data.');
            }
          }}
        >
          <label>
            Document ID
            <input name="documentId" required />
          </label>
          <label>
            File URL
            <input name="fileUrl" placeholder="https://" required />
          </label>
          <button type="submit" className="btn" disabled={ocrMutation.isPending}>
            {ocrMutation.isPending ? 'Processing...' : 'Extract Data'}
          </button>
        </form>
        <pre className="ai-output">{ocr || 'Extraction output will appear here.'}</pre>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Summarize Application</h2>
        </header>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            try {
              const result = await summarizationMutation.mutateAsync({
                applicationId: String(formData.get('applicationId') ?? ''),
                notes: String(formData.get('notes') ?? ''),
              });
              setSummary(JSON.stringify(result, null, 2));
            } catch (error) {
              console.error('Summarization failed', error);
              setSummary('Unable to summarize application at this time.');
            }
          }}
        >
          <label>
            Application ID
            <input name="applicationId" required />
          </label>
          <label className="grid-full">
            Notes
            <textarea name="notes" rows={4} placeholder="Paste underwriting notes" required />
          </label>
          <button type="submit" className="btn" disabled={summarizationMutation.isPending}>
            {summarizationMutation.isPending ? 'Summarizing...' : 'Summarize'}
          </button>
        </form>
        <pre className="ai-output">{summary || 'Summary will appear here.'}</pre>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Risk Score</h2>
        </header>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const financials: Record<string, number> = {};
            const metrics = ['revenue', 'ebitda', 'debt'];
            metrics.forEach((metric) => {
              const value = formData.get(metric);
              if (value) financials[metric] = Number(value);
            });
            try {
              const result = await riskMutation.mutateAsync({
                applicationId: String(formData.get('riskApplicationId') ?? ''),
                financials,
              });
              setRisk(JSON.stringify(result, null, 2));
            } catch (error) {
              console.error('Risk scoring failed', error);
              setRisk('Unable to generate risk score.');
            }
          }}
        >
          <label>
            Application ID
            <input name="riskApplicationId" required />
          </label>
          <label>
            Revenue
            <input name="revenue" type="number" />
          </label>
          <label>
            EBITDA
            <input name="ebitda" type="number" />
          </label>
          <label>
            Debt
            <input name="debt" type="number" />
          </label>
          <button type="submit" className="btn" disabled={riskMutation.isPending}>
            {riskMutation.isPending ? 'Scoring...' : 'Score Risk'}
          </button>
        </form>
        <pre className="ai-output">{risk || 'Risk score output will appear here.'}</pre>
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Lender Matching</h2>
        </header>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            try {
              const result = (await matchMutation.mutateAsync({
                applicationId: String(formData.get('matchApplicationId') ?? ''),
                criteria: {
                  industry: String(formData.get('industry') ?? ''),
                  amount: Number(formData.get('amount') ?? 0),
                },
              })) as LenderMatchSuggestion[];
              setSuggestions(result ?? []);
            } catch (error) {
              console.error('Lender matching failed', error);
              setSuggestions([]);
            }
          }}
        >
          <label>
            Application ID
            <input name="matchApplicationId" required />
          </label>
          <label>
            Industry
            <input name="industry" required />
          </label>
          <label>
            Amount Requested
            <input name="amount" type="number" required />
          </label>
          <button type="submit" className="btn" disabled={matchMutation.isPending}>
            {matchMutation.isPending ? 'Matching...' : 'Find Lenders'}
          </button>
        </form>
        <ul className="list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.lenderId}>
              <strong>{suggestion.lenderId}</strong> - Score: {(suggestion.score * 100).toFixed(0)}%
              <p>{suggestion.rationale}</p>
            </li>
          ))}
          {suggestions.length === 0 && <li>No suggestions yet.</li>}
        </ul>
      </section>
    </div>
  );
}
