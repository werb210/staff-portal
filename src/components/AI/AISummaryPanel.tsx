import { useAIStore } from '../../store/aiStore';

export function AISummaryPanel() {
  const { extractions, summaries, riskScores, lenderMatches } = useAIStore();

  return (
    <section className="card ai-summary">
      <header className="card__header">
        <h2>AI Insights</h2>
        <span>
          {extractions.length} OCR • {summaries.length} summaries • {riskScores.length} risk scores
        </span>
      </header>
      <div className="ai-summary__grid">
        <div>
          <h3>Latest Document Insight</h3>
          <pre className="ai-output">
            {extractions.length > 0 ? JSON.stringify(extractions[extractions.length - 1], null, 2) : 'No extractions yet.'}
          </pre>
        </div>
        <div>
          <h3>Most Recent Summary</h3>
          <pre className="ai-output">
            {summaries.length > 0 ? JSON.stringify(summaries[summaries.length - 1], null, 2) : 'No summaries yet.'}
          </pre>
        </div>
        <div>
          <h3>Risk Score Snapshot</h3>
          <pre className="ai-output">
            {riskScores.length > 0 ? JSON.stringify(riskScores[riskScores.length - 1], null, 2) : 'No risk scores yet.'}
          </pre>
        </div>
        <div>
          <h3>Suggested Lender Matches</h3>
          <ul className="list">
            {lenderMatches.length === 0 && <li>No matches generated yet.</li>}
            {lenderMatches.map((match) => (
              <li key={match.lenderId}>
                <strong>{match.lenderId}</strong> – {(match.score * 100).toFixed(0)}%
                <p>{match.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
