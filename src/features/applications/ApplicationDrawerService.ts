export async function fetchBanking(appId: string) {
  const res = await fetch(`/api/banking/${appId}`);
  if (!res.ok) throw new Error("Failed to load banking");
  return res.json();
}

export async function fetchFinancials(appId: string) {
  const res = await fetch(`/api/financials/${appId}`);
  if (!res.ok) throw new Error("Failed to load financials");
  return res.json();
}

export async function fetchLenderRecommendations(appId: string) {
  const res = await fetch(`/api/lenders/recommendations?appId=${appId}`);
  if (!res.ok) throw new Error("Failed to load lenders");
  return res.json();
}

export async function sendToLender(body: { appId: string; lenderId: string }) {
  const res = await fetch(`/api/lenders/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to send to lender");
  return res.json();
}

export async function fetchAiSummary(appId: string) {
  const res = await fetch(`/api/ai/summary/${appId}`);
  if (!res.ok) throw new Error("Failed to load AI summary");
  return res.json();
}
